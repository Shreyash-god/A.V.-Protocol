import React, { useState } from 'react';
import { Terminal, Lock, Code, Save, X } from 'lucide-react';

interface DeveloperConsoleProps {
    onClose: () => void;
}

const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('// J.A.R.V.I.S. Core Logic v4.2\n\nfunction initSystem() {\n  return true;\n}');

    const handleLogin = () => {
        if (password === 'admin' || password === 'jarvis') {
            setIsAuthenticated(true);
        } else {
            alert("ACCESS DENIED");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
                 <div className="w-80 bg-slate-900 border border-red-900/50 p-6 rounded text-center">
                     <Lock className="w-10 h-10 text-red-500 mx-auto mb-4"/>
                     <h2 className="text-red-500 font-mono text-lg mb-4">RESTRICTED ACCESS</h2>
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-black border border-red-900 p-2 text-red-500 font-mono text-center outline-none mb-4"
                       placeholder="ENTER PASSCODE"
                     />
                     <div className="flex gap-2">
                        <button onClick={handleLogin} className="flex-1 bg-red-900/30 text-red-500 py-2 font-mono hover:bg-red-900/50">UNLOCK</button>
                        <button onClick={onClose} className="flex-1 bg-slate-800 text-slate-500 py-2 font-mono hover:bg-slate-700">ABORT</button>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col font-mono text-sm">
             <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800">
                 <div className="flex items-center gap-2 text-green-400">
                     <Terminal size={16}/> DEVELOPER CONSOLE [ROOT]
                 </div>
                 <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18}/></button>
             </div>
             
             <div className="flex flex-1 overflow-hidden">
                 <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2">
                     <div className="text-slate-500 text-xs mb-4">FILES</div>
                     <div className="text-green-400 bg-slate-800 p-1 rounded cursor-pointer">core_logic.js</div>
                     <div className="text-slate-400 p-1 cursor-pointer">neural_net.config</div>
                     <div className="text-slate-400 p-1 cursor-pointer">voice_synth.dat</div>
                 </div>
                 <div className="flex-1 bg-[#0d1117] p-4 overflow-auto">
                     <textarea 
                       value={code}
                       onChange={(e) => setCode(e.target.value)}
                       className="w-full h-full bg-transparent text-slate-300 outline-none font-mono resize-none"
                       spellCheck={false}
                     />
                 </div>
             </div>
             
             <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-end">
                 <button onClick={() => alert("Changes patched to simulated kernel.")} className="flex items-center gap-2 px-4 py-1 bg-green-700 text-white rounded text-xs hover:bg-green-600">
                     <Save size={14}/> PATCH KERNEL
                 </button>
             </div>
        </div>
    );
};

export default DeveloperConsole;
