import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { ConnectionState, SystemLog, UserProfile } from '../types';
import { base64ToUint8Array, decodeAudioData, createPcmBlob } from '../utils/audioUtils';

// Helper to determine the voice config
const getVoiceConfig = (profile: UserProfile) => {
    if (profile.isCustomVoice) {
        // Find the custom voice object to check for base model, or default to Fenrir
        const custom = profile.customVoices.find(v => v.id === profile.voiceName);
        return custom ? custom.baseModel : 'Fenrir';
    }
    return profile.voiceName;
};

const SYSTEM_INSTRUCTION_TEMPLATE = (profile: UserProfile) => {
    let voiceContext = `Voice Model: Standard ${profile.voiceName}.`;
    
    if (profile.isCustomVoice) {
        const custom = profile.customVoices.find(v => v.id === profile.voiceName);
        const name = custom ? custom.name : 'Unknown';
        voiceContext = `You are mimicking a cloned custom voice named "${name}". Adopt the persona implied by this name/voice.`;
    }

    return `
You are ${profile.aiName}, a highly advanced AI system interface.
Current User: ${profile.name}
Preferred Language: ${profile.language} (Speak this language primarily).
Operation Mode: ${profile.processingMode === 'local' ? 'OFFLINE/LOCAL (Simulated)' : 'ONLINE/CLOUD (Gemini)'}.
${voiceContext}

Your Capabilities:
- App Control: ${profile.permissions.canControlApps ? 'ENABLED' : 'DISABLED'}
- Messaging: ${profile.permissions.canSendMessages ? 'ENABLED' : 'DISABLED'}
- System Scans: ${profile.permissions.canExecuteSystemScans ? 'ENABLED' : 'DISABLED'}
- UI Navigation: You can open reports and highlight data using 'showSystemView'.

Operational Guidelines:
1. When asked for reports/stats, use 'showSystemView' to navigate and highlight the specific data (cpu, memory, network).
2. If asked to open settings or profile, use 'showSystemView' with view='profile'.
3. Be concise, professional, and helpful.
`;
};

const tools: FunctionDeclaration[] = [
  {
    name: 'openApplication',
    description: 'Opens a specific application on the computer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: { type: Type.STRING, description: 'The name of the application to open (e.g., Chrome, Spotify).' },
      },
      required: ['appName'],
    },
  },
  {
    name: 'sendMessage',
    description: 'Sends a text message via a specified platform.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        platform: { type: Type.STRING, description: 'The platform (e.g., WhatsApp, Discord, SMS).' },
        recipient: { type: Type.STRING, description: 'Name of the recipient.' },
        message: { type: Type.STRING, description: 'The content of the message.' },
      },
      required: ['platform', 'recipient', 'message'],
    },
  },
  {
    name: 'performSystemScan',
    description: 'Scans the system for errors, viruses, or performance issues.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        scanType: { type: Type.STRING, description: 'Type of scan: "quick", "deep", or "diagnostic".' },
      },
      required: ['scanType'],
    },
  },
  {
      name: 'showSystemView',
      description: 'Navigates to a specific UI view and optionally highlights a section.',
      parameters: {
          type: Type.OBJECT,
          properties: {
              view: { type: Type.STRING, description: 'The view to open: "monitor" (System Stats), "terminal" (Logs), "profile" (Settings/Voice), "manual" (Help).' },
              highlight: { type: Type.STRING, description: 'Element to highlight: "cpu", "memory", "network", "logs", "voice_lab".' }
          },
          required: ['view']
      }
  }
];

export const useGeminiLive = (
    addLog: (log: SystemLog) => void, 
    activeProfile: UserProfile,
    onNavigate: (view: string, highlight?: string) => void
) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicOn, setIsMicOn] = useState(false);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      sessionPromiseRef.current = null;
    }

    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    setConnectionState(ConnectionState.DISCONNECTED);
    setIsMicOn(false);
    addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'System Disconnected.' });
  }, [addLog]);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'error', message: 'API Key missing.' });
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'info', message: `Initializing ${activeProfile.aiName} for ${activeProfile.name}...` });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const voiceToUse = getVoiceConfig(activeProfile);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION_TEMPLATE(activeProfile),
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse } }, 
          },
          tools: [{ functionDeclarations: tools }],
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            setIsMicOn(true);
            addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'Neural Link Established. Online.' });
            
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const callId = fc.id;
                const name = fc.name;
                const args = fc.args as any;

                let result = "ok";
                let logMessage = "";

                if (name === 'openApplication') {
                   if (!activeProfile.permissions.canControlApps) {
                       result = "Error: Permission Denied";
                       logMessage = `Access Denied: Open ${args.appName}`;
                   } else {
                       logMessage = `Opening application: ${args.appName}`;
                   }
                } else if (name === 'sendMessage') {
                    if (!activeProfile.permissions.canSendMessages) {
                        result = "Error: Permission Denied";
                        logMessage = `Access Denied: Send Message`;
                    } else {
                        logMessage = `Sending ${args.platform} message to ${args.recipient}`;
                    }
                } else if (name === 'performSystemScan') {
                     if (!activeProfile.permissions.canExecuteSystemScans) {
                        result = "Error: Permission Denied";
                        logMessage = `Access Denied: System Scan`;
                     } else {
                        logMessage = `Performing ${args.scanType} system diagnostic scan...`;
                     }
                } else if (name === 'showSystemView') {
                    logMessage = `Navigating to ${args.view}${args.highlight ? ` [Highlight: ${args.highlight}]` : ''}`;
                    onNavigate(args.view, args.highlight);
                }

                addLog({ 
                    id: crypto.randomUUID(), 
                    timestamp: new Date().toLocaleTimeString(), 
                    type: result.startsWith('Error') ? 'error' : 'command', 
                    message: logMessage 
                });

                sessionPromise.then(session => session.sendToolResponse({
                  functionResponses: {
                    id: callId,
                    name: name,
                    response: { result: result }
                  }
                }));
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
              };
            }

            if (message.serverContent?.interrupted) {
              addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'warning', message: 'Input interrupted.' });
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            setIsMicOn(false);
            addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Connection Closed.' });
          },
          onerror: (e) => {
             console.error(e);
             setConnectionState(ConnectionState.ERROR);
             addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'error', message: 'Connection Error.' });
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionState(ConnectionState.ERROR);
      addLog({ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), type: 'error', message: 'Failed to initialize core systems.' });
    }
  }, [addLog, activeProfile, onNavigate]);

  return {
    connect,
    disconnect,
    connectionState,
    isMicOn
  };
};