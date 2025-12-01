import React, { useState, useCallback, useEffect } from 'react';
import { Power, Mic, MicOff, Settings, ShieldCheck, Globe, MessageSquare, User, Menu, Book, Code, Cloud, HardDrive, LogOut } from 'lucide-react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { ConnectionState, SystemLog, UserProfile, AuthUser } from './types';
import JarvisOrb from './components/JarvisOrb';
import SystemMonitor from './components/SystemMonitor';
import Terminal from './components/Terminal';
import ProfileManager from './components/ProfileManager';
import LoginScreen from './components/LoginScreen';
import UserManual from './components/UserManual';
import DeveloperConsole from './components/DeveloperConsole';
import UpdateLog from './components/UpdateLog';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default_admin',
  name: 'Stark',
  aiName: 'J.A.R.V.I.S.',
  language: 'en-US',
  voiceName: 'Fenrir',
  isCustomVoice: false,
  customVoices: [],
  processingMode: 'cloud',
  permissions: {
    canControlApps: true,
    canSendMessages: true,
    canExecuteSystemScans: true,
    canAccessFiles: true
  },
  themeColor: 'cyan'
};

const App: React.FC = () => {
  // Auth State
  const [authUser, setAuthUser] = useState<AuthUser>({ isAuthenticated: false, profileId: null });
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  // Profile State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('jarvis_profiles');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.map((p: any) => ({
                ...DEFAULT_PROFILE,
                ...p,
                customVoices: p.customVoices || [] // Migration safety
            }));
        } catch (e) {
            return [DEFAULT_PROFILE];
        }
    }
    return [DEFAULT_PROFILE];
  });
  
  // UI Navigation State
  const [activeProfileId, setActiveProfileId] = useState<string>(profiles[0].id);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Highlight State for "Show and Report" feature
  const [highlightedSection, setHighlightedSection] = useState<string | undefined>(undefined);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Persist Profiles
  useEffect(() => {
    localStorage.setItem('jarvis_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Handle auto-clear highlights
  useEffect(() => {
      if (highlightedSection) {
          const timer = setTimeout(() => setHighlightedSection(undefined), 5000);
          return () => clearTimeout(timer);
      }
  }, [highlightedSection]);

  const addLog = useCallback((log: SystemLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const handleAiNavigation = useCallback((view: string, highlight?: string) => {
      setHighlightedSection(highlight);
      if (view === 'profile') setShowProfileManager(true);
      if (view === 'manual') setShowManual(true);
      // 'monitor' and 'terminal' are always visible on desktop, but could handle mobile here
  }, []);

  const { connect, disconnect, connectionState } = useGeminiLive(addLog, activeProfile, handleAiNavigation);

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  const toggleConnection = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  };

  const getStatusText = () => {
    switch(connectionState) {
      case ConnectionState.CONNECTED: return activeProfile.processingMode === 'local' ? "LOCAL LINK ACTIVE" : "UPLINK ESTABLISHED";
      case ConnectionState.CONNECTING: return "HANDSHAKE INITIATED...";
      case ConnectionState.ERROR: return "CONNECTION FAILURE";
      default: return "STANDBY";
    }
  };

  const getThemeColors = () => {
      switch(activeProfile.themeColor) {
          case 'purple': return { text: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500' };
          case 'green': return { text: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500', shadow: 'shadow-green-500' };
          case 'red': return { text: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500', shadow: 'shadow-red-500' };
          case 'amber': return { text: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500' };
          default: return { text: 'text-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-500', shadow: 'shadow-cyan-500' };
      }
  };

  const theme = getThemeColors();

  // Profile Handlers
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProfile = () => {
    const newProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: crypto.randomUUID(),
      name: 'New User',
      aiName: 'Assistant',
      customVoices: []
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles.find(p => p.id !== id)?.id || profiles[0].id);
    }
  };

  const handleLogin = (userData: Partial<UserProfile>) => {
      // Find if user exists or update current default
      const updatedProfiles = profiles.map(p => {
          if (p.id === activeProfileId) {
              return { ...p, ...userData, id: p.id };
          }
          return p;
      });
      setProfiles(updatedProfiles);
      setAuthUser({ isAuthenticated: true, profileId: activeProfileId });
  };

  const handleLogout = () => {
      disconnect();
      setAuthUser({ isAuthenticated: false, profileId: null });
  };

  if (!authUser.isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-slate-700 selection:text-white relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${activeProfile.themeColor}-500 to-transparent opacity-50`}></div>

      {/* Header */}
      <header className="flex items-center justify-between p-3 md:px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-30 shadow-lg">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full border ${theme.border} flex items-center justify-center bg-slate-900/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
             <div className={`w-5 h-5 ${theme.bg} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] font-mono text-white">{activeProfile.aiName.toUpperCase()}</h1>
            <p className={`text-[9px] ${theme.text} uppercase tracking-[0.3em]`}>
                {activeProfile.processingMode === 'cloud' ? 'Cloud Link' : 'Local Host'} • Integrated Interface
            </p>
          </div>
        </div>
        
        <div className={`font-mono font-bold tracking-wider ${theme.text} hidden md:block opacity-80`}>
          {getStatusText()}
        </div>

        <div className="flex items-center gap-4 relative">
          
          {/* User Menu Trigger */}
          <div className="relative">
            <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
                <div className="w-6 h-6 rounded-full bg-slate-600 overflow-hidden">
                    {activeProfile.photoUrl ? (
                        <img src={activeProfile.photoUrl} alt="User" className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">{activeProfile.name.charAt(0)}</div>
                    )}
                </div>
                <span className="text-xs font-mono uppercase hidden sm:block">{activeProfile.name}</span>
                <Settings size={14} className="text-slate-400"/>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800 mb-2">
                        <div className="text-xs text-slate-500">Signed in as</div>
                        <div className="text-sm font-bold truncate">{activeProfile.email || activeProfile.name}</div>
                    </div>
                    
                    <button onClick={() => { setShowProfileManager(true); setShowUserMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-2">
                        <User size={16} className={theme.text}/> Profile Settings
                    </button>
                    <button onClick={() => { setShowManual(true); setShowUserMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-2">
                        <Book size={16} className={theme.text}/> User Manual
                    </button>
                    <button onClick={() => { setShowDevConsole(true); setShowUserMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-2">
                        <Code size={16} className={theme.text}/> Developer Console
                    </button>
                    
                    <div className="border-t border-slate-800 mt-2 pt-2">
                        <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm hover:bg-red-900/20 text-red-400 flex items-center gap-2">
                            <LogOut size={16}/> Logout
                        </button>
                    </div>
                </div>
            )}
          </div>

          <button 
            onClick={toggleConnection}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg
              ${isConnected 
                ? 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-red-900/50' 
                : `${theme.border} ${theme.text} hover:bg-slate-800 shadow-cyan-900/20`}
            `}
            title={isConnected ? "Terminate Uplink" : "Initialize System"}
          >
            <Power size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left: System & Updates */}
        <aside className="w-80 hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                 {/* Processing Mode Toggle */}
                <div className="bg-slate-900/50 border border-slate-700 p-3 rounded">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Processing Mode</div>
                    <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                        <button 
                            onClick={() => handleUpdateProfile({...activeProfile, processingMode: 'cloud'})}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] transition-all ${activeProfile.processingMode === 'cloud' ? 'bg-cyan-900 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Cloud size={12}/> GEMINI (Cloud)
                        </button>
                        <button 
                            onClick={() => handleUpdateProfile({...activeProfile, processingMode: 'local'})}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] transition-all ${activeProfile.processingMode === 'local' ? 'bg-purple-900 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <HardDrive size={12}/> LOCAL (Sim)
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 p-3 rounded text-xs font-mono text-slate-400">
                    <h4 className="border-b border-slate-700 pb-2 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Active Permissions
                    </h4>
                    <ul className="space-y-2">
                        {Object.entries(activeProfile.permissions).map(([key, val]) => (
                             <li key={key} className="flex items-center gap-2 justify-between">
                                <span>{key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                                <div className={`w-2 h-2 rounded-full ${val ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`}></div> 
                             </li>
                        ))}
                    </ul>
                </div>
                
                <div className="h-64">
                    <SystemMonitor highlight={highlightedSection} />
                </div>
            </div>
            
            <div className="h-1/3 border-t border-slate-800">
                <UpdateLog />
            </div>
        </aside>

        {/* Center: AI Interaction */}
        <section className="flex-1 flex flex-col relative">
            
            {/* Overlay Grid */}
            <div className="absolute inset-4 border border-slate-800/30 rounded-lg pointer-events-none z-0">
                <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l ${theme.border}`}></div>
                <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${theme.border}`}></div>
                <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${theme.border}`}></div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r ${theme.border}`}></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="mb-12 scale-125">
                    <JarvisOrb 
                    isActive={isConnected} 
                    state={connectionState === ConnectionState.ERROR ? 'error' : isConnected ? 'listening' : 'idle'} 
                    />
                </div>
                
                <div className="text-center space-y-3 max-w-lg px-4">
                    <h2 className="text-3xl font-light text-white uppercase tracking-[0.2em] drop-shadow-lg">
                    {isConnected ? "Awaiting Command" : `Welcome, ${activeProfile.name}`}
                    </h2>
                    <p className={`text-sm ${theme.text} font-mono opacity-80`}>
                    {isConnected 
                        ? `Channel Open: ${activeProfile.isCustomVoice ? (activeProfile.customVoices.find(v => v.id === activeProfile.voiceName)?.name || 'Custom') : activeProfile.voiceName} Voice Module` 
                        : "Systems Idle. Initialize to begin."}
                    </p>
                </div>

                <div className="mt-12 flex gap-6">
                    <div className={`p-4 rounded-full border border-slate-700 transition-all duration-500 ${isConnected ? `${theme.bg} text-white shadow-[0_0_20px_rgba(255,255,255,0.3)]` : 'bg-slate-900 text-slate-600'}`}>
                        {isConnected ? <Mic /> : <MicOff />}
                    </div>
                </div>
            </div>
        </section>

        {/* Right: Terminal */}
        <aside className="w-80 hidden xl:block border-l border-slate-800 bg-slate-950 p-4">
            <Terminal logs={logs} />
        </aside>

      </main>

      {/* Footer */}
      <footer className="p-1 border-t border-slate-800 bg-slate-950 text-center flex justify-between px-4 text-[9px] text-slate-600 font-mono uppercase tracking-widest">
        <span>STARK INDUSTRIES SECURE SERVER</span>
        <span>SESSION ID: {activeProfileId.slice(0,8)}</span>
      </footer>

      {/* Modals */}
      {showProfileManager && (
        <ProfileManager 
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          onUpdateProfile={handleUpdateProfile}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileManager(false)}
        />
      )}

      {showManual && <UserManual onClose={() => setShowManual(false)} />}
      
      {showDevConsole && <DeveloperConsole onClose={() => setShowDevConsole(false)} />}
    </div>
  );
};

export default App;