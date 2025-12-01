import React, { useState } from 'react';
import { UserProfile, CustomVoice } from '../types';
import { User, Globe, Mic, Cpu, MessageSquare, Shield, Upload, Trash2, Plus, Save, Edit, Check, Palette } from 'lucide-react';

interface ProfileManagerProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onCreateProfile: () => void;
  onDeleteProfile: (id: string) => void;
  onClose: () => void;
}

const PREDEFINED_VOICES = [
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', desc: 'Deep, Commanding' },
  { id: 'Puck', name: 'Puck', gender: 'Male', desc: 'Playful, Light' },
  { id: 'Charon', name: 'Charon', gender: 'Male', desc: 'Steady, Neutral' },
  { id: 'Kore', name: 'Kore', gender: 'Female', desc: 'Calm, Soothing' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female', desc: 'Bright, Clear' },
];

const LANGUAGES = [
  { code: 'en-US', name: 'English (United States)' },
  { code: 'bn-IN', name: 'Bengali (Bangla)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'de-DE', name: 'German (Deutsch)' },
  { code: 'fr-FR', name: 'French (Français)' },
  { code: 'es-ES', name: 'Spanish (Español)' },
];

const THEMES = [
  { id: 'cyan', color: 'bg-cyan-500', name: 'Stark Cyan' },
  { id: 'purple', color: 'bg-purple-500', name: 'Nebula Purple' },
  { id: 'green', color: 'bg-green-500', name: 'Matrix Green' },
  { id: 'red', color: 'bg-red-500', name: 'Warning Red' },
  { id: 'amber', color: 'bg-amber-500', name: 'Solar Amber' },
];

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onCreateProfile,
  onDeleteProfile,
  onClose
}) => {
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  
  // Custom Voice Logic
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [newVoiceName, setNewVoiceName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCreateCustomVoice = () => {
      const newVoice: CustomVoice = {
          id: crypto.randomUUID(),
          name: 'New Custom Voice',
          baseModel: 'Fenrir',
          createdAt: new Date().toISOString()
      };
      onUpdateProfile({
          ...activeProfile,
          customVoices: [...(activeProfile.customVoices || []), newVoice],
          voiceName: newVoice.id,
          isCustomVoice: true
      });
      setEditingVoiceId(newVoice.id);
      setNewVoiceName(newVoice.name);
  };

  const handleFileUpload = (voiceId: string) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
          setUploadProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setIsUploading(false);
                  return 100;
              }
              return prev + 10;
          });
      }, 200);
  };

  const deleteCustomVoice = (voiceId: string) => {
      const updatedVoices = activeProfile.customVoices.filter(v => v.id !== voiceId);
      let newActiveVoice = activeProfile.voiceName;
      let isCustom = activeProfile.isCustomVoice;
      
      if (activeProfile.voiceName === voiceId) {
          newActiveVoice = 'Fenrir';
          isCustom = false;
      }
      onUpdateProfile({
          ...activeProfile, 
          customVoices: updatedVoices,
          voiceName: newActiveVoice,
          isCustomVoice: isCustom
      });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl flex shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Sidebar: Profile List */}
        <div className="w-1/3 md:w-1/4 border-r border-slate-800 bg-slate-950 flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-slate-100 font-mono text-xs tracking-[0.2em] uppercase mb-1">Identity Select</h2>
            <p className="text-slate-500 text-[10px]">Select user protocol</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {profiles.map(profile => (
              <div 
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className={`p-4 flex items-center gap-3 cursor-pointer border-l-4 transition-all duration-200 ${
                  profile.id === activeProfileId 
                  ? `bg-slate-800/80 border-cyan-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]` 
                  : 'border-transparent hover:bg-slate-900/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-900 shadow-lg ${profile.id === activeProfileId ? 'bg-cyan-400 scale-110' : 'bg-slate-700'} transition-transform`}>
                  {profile.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className={`font-mono font-bold truncate ${profile.id === activeProfileId ? 'text-white' : 'text-slate-400'}`}>{profile.name}</div>
                  <div className="text-[9px] text-slate-500 uppercase truncate">
                      {profile.email || 'Local Account'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={onCreateProfile}
              className="w-full flex items-center justify-center gap-2 py-3 rounded border border-dashed border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400 hover:bg-cyan-900/10 transition-all font-mono text-xs uppercase"
            >
              <Plus size={14} /> Initialize New User
            </button>
          </div>
        </div>

        {/* Main Content: Settings */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 relative">
          
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur z-10">
             <div className="flex items-center gap-3">
               <User className="text-cyan-400" size={20}/>
               <div>
                   <h2 className="text-white font-mono text-lg tracking-wider">Profile Configuration</h2>
                   <p className="text-[10px] text-slate-500 font-mono">ID: {activeProfile.id.slice(0, 8)}...</p>
               </div>
             </div>
             <button onClick={onClose} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono uppercase rounded shadow-lg shadow-cyan-900/50 transition-all hover:scale-105">
               Save System State
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
            
            {/* Identity Section */}
            <section className="bg-slate-800/30 p-5 rounded-lg border border-slate-800">
              <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span> 
                  Core Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">User Designation (Your Name)</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        value={activeProfile.name}
                        onChange={(e) => onUpdateProfile({...activeProfile, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                    <Edit size={12} className="absolute right-3 top-3 text-slate-600"/>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">AI Agent Designation (Bot Name)</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        value={activeProfile.aiName}
                        onChange={(e) => onUpdateProfile({...activeProfile, aiName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                     <div className="absolute right-3 top-3 text-xs font-mono text-slate-600">AI</div>
                  </div>
                </div>
                
                 <div className="space-y-1">
                  <label className="text-xs text-slate-400 flex items-center gap-1 font-mono"><Palette size={12}/> UI Theme Protocol</label>
                  <div className="flex gap-2 mt-2">
                     {THEMES.map(theme => (
                         <button
                            key={theme.id}
                            onClick={() => onUpdateProfile({...activeProfile, themeColor: theme.id as any})}
                            className={`w-8 h-8 rounded-full ${theme.color} border-2 ${activeProfile.themeColor === theme.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'} transition-all`}
                            title={theme.name}
                         />
                     ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 flex items-center gap-1 font-mono"><Globe size={12}/> Communication Language</label>
                  <select 
                    value={activeProfile.language}
                    onChange={(e) => onUpdateProfile({...activeProfile, language: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Voice Laboratory */}
            <section className="bg-slate-800/30 p-5 rounded-lg border border-slate-800 relative">
              <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                 Voice Synthesis Module
              </h3>
              
              <div className="space-y-6">
                {/* Standard Voices */}
                <div>
                    <h4 className="text-[10px] text-slate-500 uppercase mb-2 font-bold">Standard Models</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {PREDEFINED_VOICES.map(voice => (
                            <button
                                key={voice.id}
                                onClick={() => onUpdateProfile({...activeProfile, voiceName: voice.id, isCustomVoice: false})}
                                className={`p-3 rounded-lg border text-center transition-all duration-200 relative group ${
                                    !activeProfile.isCustomVoice && activeProfile.voiceName === voice.id
                                    ? 'bg-cyan-900/40 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-900/20' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-900'
                                }`}
                            >
                                <div className="text-xs font-bold mb-1">{voice.name}</div>
                                <div className="text-[9px] uppercase opacity-60">{voice.gender}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Voices */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] text-slate-500 uppercase font-bold">Custom Cloned Models</h4>
                        <button onClick={handleCreateCustomVoice} className="text-[10px] flex items-center gap-1 text-purple-400 hover:text-purple-300">
                            <Plus size={10} /> CREATE NEW
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(activeProfile.customVoices || []).map(voice => (
                            <div key={voice.id} className={`p-4 rounded-lg border transition-all ${
                                activeProfile.isCustomVoice && activeProfile.voiceName === voice.id 
                                ? 'bg-purple-900/20 border-purple-500' 
                                : 'bg-slate-950 border-slate-800'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    {editingVoiceId === voice.id ? (
                                        <div className="flex gap-2 items-center">
                                            <input 
                                                value={newVoiceName}
                                                onChange={(e) => setNewVoiceName(e.target.value)}
                                                className="bg-black border border-purple-500 text-xs px-2 py-1 rounded text-white w-32"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const updated = (activeProfile.customVoices || []).map(v => v.id === voice.id ? {...v, name: newVoiceName} : v);
                                                    onUpdateProfile({...activeProfile, customVoices: updated});
                                                    setEditingVoiceId(null);
                                                }}
                                                className="text-green-400 hover:text-green-300"
                                            >
                                                <Check size={14}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                             <div className="text-sm font-bold text-slate-200">{voice.name}</div>
                                             <button onClick={() => { setEditingVoiceId(voice.id); setNewVoiceName(voice.name); }} className="text-slate-600 hover:text-white">
                                                <Edit size={10} />
                                             </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                         <button 
                                            onClick={() => onUpdateProfile({...activeProfile, voiceName: voice.id, isCustomVoice: true})}
                                            className={`text-[10px] px-2 py-0.5 rounded border ${
                                                activeProfile.isCustomVoice && activeProfile.voiceName === voice.id 
                                                ? 'bg-purple-500 text-white border-purple-500' 
                                                : 'text-slate-500 border-slate-700 hover:border-slate-500'
                                            }`}
                                         >
                                            {activeProfile.isCustomVoice && activeProfile.voiceName === voice.id ? 'ACTIVE' : 'SELECT'}
                                         </button>
                                         <button onClick={() => deleteCustomVoice(voice.id)} className="text-red-900 hover:text-red-500">
                                            <Trash2 size={14} />
                                         </button>
                                    </div>
                                </div>

                                {/* Training Section */}
                                <div className="mt-3 bg-slate-900 p-2 rounded border border-slate-800/50">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Training Progress</span>
                                        <span>{uploadProgress > 0 ? uploadProgress : 100}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
                                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${uploadProgress > 0 ? uploadProgress : 100}%` }}></div>
                                    </div>
                                    
                                    <label className={`flex items-center justify-center gap-2 w-full py-1.5 border border-dashed rounded cursor-pointer transition-colors text-[10px] uppercase font-bold ${isUploading ? 'border-slate-700 text-slate-600' : 'border-slate-700 text-purple-400 hover:border-purple-500 hover:bg-purple-900/10'}`}>
                                        <Upload size={12} />
                                        {isUploading ? 'Analyzing...' : 'Add Voice Sample'}
                                        <input type="file" accept="audio/*" className="hidden" onChange={() => handleFileUpload(voice.id)} disabled={isUploading}/>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

              </div>
            </section>

             {/* Permissions */}
             <section className="bg-slate-800/30 p-5 rounded-lg border border-slate-800">
              <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 Security Clearance
              </h3>
              
              <div className="space-y-3">
                 {[
                   { id: 'canControlApps', label: 'App Control Protocol', desc: 'Allow AI to launch apps', icon: Cpu, color: 'text-cyan-400' },
                   { id: 'canSendMessages', label: 'Comms Link', desc: 'Secure Messaging Access', icon: MessageSquare, color: 'text-green-400' },
                   { id: 'canExecuteSystemScans', label: 'Diagnostics', desc: 'Deep System Analysis', icon: Shield, color: 'text-red-400' }
                 ].map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                        <perm.icon size={18} className={perm.color}/>
                        <div>
                            <div className="text-sm text-slate-200">{perm.label}</div>
                            <div className="text-[10px] text-slate-500">{perm.desc}</div>
                        </div>
                        </div>
                        <button 
                            onClick={() => onUpdateProfile({
                                ...activeProfile, 
                                permissions: {...activeProfile.permissions, [perm.id]: !activeProfile.permissions[perm.id as keyof typeof activeProfile.permissions]}
                            })}
                            className={`w-11 h-6 rounded-full relative transition-colors ${activeProfile.permissions[perm.id as keyof typeof activeProfile.permissions] ? 'bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-slate-700'}`}
                        >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${activeProfile.permissions[perm.id as keyof typeof activeProfile.permissions] ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                 ))}
              </div>
            </section>
            
            <div className="pt-4 flex justify-between items-center border-t border-slate-800 mt-8">
                <div className="text-[10px] text-slate-600 font-mono">
                    LAST LOGIN: {new Date().toLocaleDateString()}
                </div>
               {profiles.length > 1 && (
                 <button 
                   onClick={() => onDeleteProfile(activeProfile.id)}
                   className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors text-xs font-mono uppercase border border-red-900/30 hover:border-red-500/50"
                 >
                   <Trash2 size={14} /> Purge Profile
                 </button>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;