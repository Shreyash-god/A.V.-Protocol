import React, { useState } from 'react';
import { Book, X, Download, Monitor, Mic, Settings, Shield } from 'lucide-react';

interface UserManualProps {
    onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'setup' | 'voice' | 'features'>('setup');

    const downloadPdf = () => {
        // Create a blob acting as a PDF for simulation
        const content = "J.A.R.V.I.S. Protocol Manual\n\n[CONFIDENTIAL]\nThis document contains setup instructions.";
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "JARVIS_MANUAL_v4.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-700 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900">
                    <h2 className="text-white font-mono text-lg flex items-center gap-2">
                        <Book className="text-cyan-400"/> System Manual
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={downloadPdf} className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors">
                            <Download size={14}/> PDF
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-48 bg-slate-950 border-r border-slate-800 p-2 space-y-1">
                        {[
                            { id: 'setup', label: 'Setup & Install', icon: Monitor },
                            { id: 'features', label: 'Features & Ops', icon: Shield },
                            { id: 'voice', label: 'Voice Cloning', icon: Mic },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-3 text-xs font-mono uppercase text-left rounded ${activeTab === tab.id ? 'bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-500 hover:bg-slate-900'}`}
                            >
                                <tab.icon size={16}/> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto bg-slate-900">
                        {activeTab === 'setup' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h1 className="text-2xl text-white font-light mb-4">Initial Setup Guide</h1>
                                <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                    <h3 className="text-cyan-400 font-mono mb-2">1. Windows Configuration</h3>
                                    <p className="text-slate-400 text-sm mb-4">Ensure microphone permissions are granted in Browser settings.</p>
                                    <div className="w-full h-32 bg-slate-900 rounded border border-dashed border-slate-600 flex items-center justify-center text-slate-600 text-xs">
                                        [Diagram: Browser Permission Prompt]
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                    <h3 className="text-cyan-400 font-mono mb-2">2. API Integration</h3>
                                    <p className="text-slate-400 text-sm">System automatically connects to Gemini API via env variables.</p>
                                </div>
                            </div>
                        )}
                        
                         {activeTab === 'features' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h1 className="text-2xl text-white font-light mb-4">Operational Features</h1>
                                <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                                    <li><strong className="text-cyan-400">App Control:</strong> Voice commands to open apps (e.g., "Open Spotify").</li>
                                    <li><strong className="text-cyan-400">System Diagnostics:</strong> Real-time monitoring of CPU/RAM (Simulated).</li>
                                    <li><strong className="text-cyan-400">Hybrid Mode:</strong> Toggle between Cloud (Gemini) and Local simulation.</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'voice' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h1 className="text-2xl text-white font-light mb-4">Voice Cloning Module</h1>
                                <p className="text-slate-400 text-sm">The system can mimic custom voice profiles.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <div className="text-purple-400 font-bold mb-2">Step 1</div>
                                        <p className="text-xs text-slate-300">Navigate to Profile Manager > Voice Laboratory.</p>
                                     </div>
                                     <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <div className="text-purple-400 font-bold mb-2">Step 2</div>
                                        <p className="text-xs text-slate-300">Upload a clear .mp3 or .wav sample (15s minimum).</p>
                                     </div>
                                     <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <div className="text-purple-400 font-bold mb-2">Step 3</div>
                                        <p className="text-xs text-slate-300">Wait for neural analysis to complete and name your voice.</p>
                                     </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManual;
