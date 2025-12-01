import React, { useRef, useEffect, useState } from 'react';
import { SystemLog } from '../types';
import { Terminal as TerminalIcon, Filter } from 'lucide-react';

interface TerminalProps {
  logs: SystemLog[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'command' | 'error' | 'info'>('all');

  const filteredLogs = logs.filter(log => {
      if (filter === 'all') return true;
      if (filter === 'command') return log.type === 'command';
      if (filter === 'error') return log.type === 'error' || log.type === 'warning';
      if (filter === 'info') return log.type === 'info' || log.type === 'success';
      return true;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, filter]);

  const getLogColor = (type: SystemLog['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'command': return 'text-cyan-300 font-bold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-0 flex flex-col h-full overflow-hidden shadow-inner relative group">
      <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <TerminalIcon size={14} className="text-slate-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Protocol Log</span>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-1">
            {['all', 'info', 'command', 'error'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded transition-colors ${
                        filter === f 
                        ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs md:text-sm space-y-2 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <TerminalIcon size={120} />
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-slate-600 italic text-center mt-10">No records found in current buffer...</div>
        )}
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors">
            <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`${getLogColor(log.type)} break-words flex-1`}>
              {log.type === 'command' && '> '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
