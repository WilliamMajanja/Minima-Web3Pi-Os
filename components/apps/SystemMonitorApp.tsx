
import React from 'react';
import { SystemStats } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SystemMonitorAppProps {
  stats: SystemStats;
}

const SystemMonitorApp: React.FC<SystemMonitorAppProps> = ({ stats }) => {
  // Generate mock history data
  const data = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      cpu: Math.random() * 40 + 20,
      ram: 45 + Math.random() * 5,
      temp: 40 + Math.random() * 10
    }));
  }, []);

  return (
    <div className="p-8 h-full space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Performance</h1>
        <p className="text-slate-400 text-sm">Real-time telemetry for Raspberry Pi Node</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-end">
             <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">CPU Load</span>
             <span className="text-2xl font-mono text-blue-400">{Math.round(stats.cpu)}%</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-end">
             <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Memory Usage</span>
             <span className="text-2xl font-mono text-emerald-400">{Math.round(stats.ram)}%</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="ram" stroke="#10b981" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4 md:col-span-2">
          <div className="flex justify-between items-end">
             <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Thermal Monitoring</span>
             <span className="text-2xl font-mono text-amber-400">{Math.round(stats.temp)}°C</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="stepAfter" dataKey="temp" stroke="#f59e0b" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
             <div className="w-2 h-2 rounded-full bg-amber-500" />
             <span>Active cooling fan engaged (PWM 60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitorApp;
