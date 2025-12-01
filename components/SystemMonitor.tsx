import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Wifi, Cpu, HardDrive } from 'lucide-react';
import { SystemStats } from '../types';

interface SystemMonitorProps {
    highlight?: string;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ highlight }) => {
  const [data, setData] = useState<{ time: string; cpu: number; mem: number; net: number }[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    cpuLoad: 0,
    memoryUsage: 0,
    networkLatency: 0,
    temperature: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString().split(' ')[0]; // HH:MM:SS
      
      const newCpu = Math.floor(Math.random() * 30) + 10; // Sim 10-40%
      const newMem = Math.floor(Math.random() * 20) + 40; // Sim 40-60%
      const newNet = Math.floor(Math.random() * 50) + 20; // Sim latency

      setStats({
        cpuLoad: newCpu,
        memoryUsage: newMem,
        networkLatency: newNet,
        temperature: 45 + Math.random() * 5
      });

      setData(prev => {
        const newData = [...prev, { time: timeStr, cpu: newCpu, mem: newMem, net: newNet }];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getHighlightClass = (section: string) => {
      if (highlight === section) {
          return 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-[1.02] z-10';
      }
      return 'border-cyan-900/50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* CPU & Temp */}
      <div className={`bg-slate-900/50 border p-4 rounded-lg backdrop-blur-sm transition-all duration-500 ${getHighlightClass('cpu')}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu size={18} />
            <h3 className="font-mono text-sm uppercase tracking-wider">Processing Unit</h3>
          </div>
          <span className="font-mono text-xs text-cyan-200">{stats.cpuLoad}% / {stats.temperature.toFixed(1)}°C</span>
        </div>
        <div className="h-32 w-full min-h-[128px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2', color: '#fff' }} 
                itemStyle={{ color: '#22d3ee' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fillOpacity={1} fill="url(#colorCpu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Memory */}
      <div className={`bg-slate-900/50 border p-4 rounded-lg backdrop-blur-sm transition-all duration-500 ${getHighlightClass('memory')}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <HardDrive size={18} />
            <h3 className="font-mono text-sm uppercase tracking-wider">Memory Allocation</h3>
          </div>
          <span className="font-mono text-xs text-purple-200">{stats.memoryUsage}%</span>
        </div>
        <div className="h-32 w-full min-h-[128px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
               <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', color: '#fff' }} 
                itemStyle={{ color: '#a855f7' }}
              />
              <Line type="step" dataKey="mem" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Network */}
       <div className={`bg-slate-900/50 border p-4 rounded-lg backdrop-blur-sm col-span-1 md:col-span-2 transition-all duration-500 ${getHighlightClass('network')}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-green-400">
            <Wifi size={18} />
            <h3 className="font-mono text-sm uppercase tracking-wider">Network Latency</h3>
          </div>
          <span className="font-mono text-xs text-green-200">{stats.networkLatency} ms</span>
        </div>
        <div className="h-24 w-full min-h-[96px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#22c55e', color: '#fff' }} 
                itemStyle={{ color: '#4ade80' }}
              />
              <Area type="basis" dataKey="net" stroke="#4ade80" fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;