
import React, { useState, useEffect } from 'react';
import { NodeStats, SystemStats } from '../types';

interface TopBarProps {
  nodeStats: NodeStats;
  systemStats: SystemStats;
  onSwitchOS?: () => void;
  currentOS?: 'pinet' | 'raspbian';
}

const TopBar: React.FC<TopBarProps> = ({ nodeStats, systemStats, onSwitchOS, currentOS }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 fixed top-0 left-0 right-0 glass-dark z-50 flex items-center justify-between px-4 border-b border-white/5">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C51A4A] rounded flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">PiNet<span className="text-[#C51A4A]">OS</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${nodeStats.status === 'Synced' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span>Node: {nodeStats.status}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span>Peers: {nodeStats.peers}</span>
            <div className="w-px h-3 bg-white/10" />
            <span>H: {nodeStats.blockHeight.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium">
        {onSwitchOS && (
            <button 
                onClick={onSwitchOS}
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all hover:scale-105 active:scale-95"
            >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M12 4v16"></path><path d="M4 12h16"></path></svg>
                Switch OS
            </button>
        )}

        <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-help" title="System Load">
            <svg className="w-3 h-3 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span>{Math.round(systemStats.cpu)}%</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-help" title="Core Temperature">
            <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M5 5l14 14M19 5L5 19"/></svg>
            <span>{systemStats.temp}°C</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-200 font-bold tabular-nums">
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="hidden xs:inline opacity-30">|</span>
          <span className="hidden xs:inline text-slate-400">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
