import React, { useEffect, useState } from 'react';
import { Activity, GitMerge, CheckCircle, Database } from 'lucide-react';

const UpdateLog: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const logs = [
        "Analyzing user usage patterns...",
        "Optimizing neural pathways...",
        "Updating local context database...",
        "Fetching latest Gemini models...",
        "Patching security protocol v4.2...",
        "Self-correction module: Active",
    ];

    let index = 0;
    const interval = setInterval(() => {
       if (index < logs.length) {
           setItems(prev => [logs[index], ...prev]);
           index++;
           setProgress(p => Math.min(p + 15, 100));
       } else {
           clearInterval(interval);
       }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 border-l border-slate-800 w-64 p-4 hidden xl:flex flex-col h-full font-mono">
       <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2 mb-2 flex items-center gap-2">
             <Activity size={14} className="text-cyan-400"/> System Status
          </h3>
          <div className="space-y-3">
             <div className="bg-slate-800 p-2 rounded">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Self-Training</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2 mb-2 flex items-center gap-2">
             <GitMerge size={14} className="text-purple-400"/> Update Log
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {items.map((item, idx) => (
                  <div key={idx} className="text-[10px] text-slate-400 border-l border-slate-700 pl-2 py-1 animate-in slide-in-from-left duration-300">
                      <div className="text-cyan-500 mb-0.5">{new Date().toLocaleTimeString()}</div>
                      {item}
                  </div>
              ))}
              <div className="text-[10px] text-slate-600 italic">Listening for updates...</div>
          </div>
       </div>
    </div>
  );
};

export default UpdateLog;
