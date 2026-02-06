
import React, { useState, useEffect, useRef } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import TopBar from './components/TopBar';
import SetupWizard from './components/apps/SetupWizard';
import { AppId, WindowState, NodeStats, SystemStats, ClusterNode } from './types';
import MinimaNodeApp from './components/apps/MinimaNodeApp';
import SystemMonitorApp from './components/apps/SystemMonitorApp';
import TerminalApp from './components/apps/TerminalApp';
import AiAssistantApp from './components/apps/AiAssistantApp';
import WalletApp from './components/apps/WalletApp';
import MaximaMessengerApp from './components/apps/MaximaMessengerApp';
import ClusterManagerApp from './components/apps/ClusterManagerApp';
import DePAiExecutor from './components/apps/DePAiExecutor';
import ImagerUtility from './components/apps/ImagerUtility';
import FileExplorerApp from './components/apps/FileExplorerApp';
import SettingsApp from './components/apps/SettingsApp';
import VisualAssetStudio from './components/apps/VisualAssetStudio';
import { minimaService } from './services/minimaService';
import { clusterService } from './services/clusterService';
import { settingsService } from './services/settingsService';
import { systemService } from './services/systemService';

type OSMode = 'pinet' | 'raspbian';
type TransitionState = 'idle' | 'shutting-down' | 'booting';

interface WindowContainerProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  isActive: boolean;
}

const WindowContainer: React.FC<WindowContainerProps> = ({ title, children, onClose, onMinimize, onFocus, isActive }) => {
  return (
    <div 
      onMouseDown={onFocus}
      className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 border ${isActive ? 'border-white/20 shadow-pink-500/10' : 'border-white/5 shadow-none'}`}
    >
      <div className={`h-10 ${isActive ? 'bg-slate-800' : 'bg-slate-900'} border-b border-white/5 flex items-center justify-between px-4 select-none`}>
        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />}
            {title}
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 12H6"/></svg>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-6 h-6 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
      </div>
      <div className="flex-1 bg-slate-900/90 backdrop-blur-md relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [currentOS, setCurrentOS] = useState<OSMode>('pinet');
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [bootLog, setBootLog] = useState<string[]>([]);
  
  // Raspbian State
  const [raspMenuOpen, setRaspMenuOpen] = useState(false);
  const [termPos, setTermPos] = useState({ x: 320, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Raspbian Terminal Interactive State
  const [raspTermOpen, setRaspTermOpen] = useState(true);
  const [raspTermInput, setRaspTermInput] = useState('');
  const [raspTermHistory, setRaspTermHistory] = useState<string[]>([
    "Linux raspberrypi 6.5.0-rpi-v8 #1 SMP PREEMPT Debian 13 (trixie) aarch64 GNU/Linux",
    "The programs included with the Debian GNU/Linux system are free software;",
    "the exact distribution terms for each program are described in the",
    "individual files in /usr/share/doc/*/copyright.",
    "",
    "Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent",
    "permitted by applicable law.",
    "",
    "Type 'help' for a list of commands."
  ]);
  const raspTermEndRef = useRef<HTMLDivElement>(null);
  const raspTermInputRef = useRef<HTMLInputElement>(null);

  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'minima-node', title: 'Minima Node', isOpen: true, isMinimized: false, zIndex: 10 },
    { id: 'system-monitor', title: 'System Monitor', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'terminal', title: 'PiNet Shell', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'ai-assistant', title: 'PiNet AI Assistant', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'wallet', title: 'Web3 Wallet', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'maxima-messenger', title: 'Maxima Messenger', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'cluster-manager', title: 'Cluster Hub', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'depai-executor', title: 'DePAI Executor', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'imager-utility', title: 'Pi Imager Config', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'file-explorer', title: 'File Explorer', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'settings', title: 'System Settings', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'visual-studio', title: 'Visual Asset Studio', isOpen: false, isMinimized: false, zIndex: 1 },
  ]);

  const [activeId, setActiveId] = useState<AppId>('minima-node');
  const [nodeStats, setNodeStats] = useState<NodeStats>(minimaService.stats);
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>(clusterService.nodes);
  const [wallpaper, setWallpaper] = useState(settingsService.wallpaper);

  const [sysStats, setSysStats] = useState<SystemStats>({
    cpu: 24, ram: 45, temp: 42, disk: 12
  });

  // Subscriptions to services
  useEffect(() => {
    const unsubMinima = minimaService.subscribe(() => {
        setNodeStats({...minimaService.stats});
    });
    const unsubCluster = clusterService.subscribe(() => {
        setClusterNodes([...clusterService.nodes]);
    });
    const unsubSettings = settingsService.subscribe(() => {
        setWallpaper(settingsService.wallpaper);
    });

    return () => {
        unsubMinima();
        unsubCluster();
        unsubSettings();
    };
  }, []);
  
  // Auto-scroll Raspbian Terminal
  useEffect(() => {
    if (raspTermOpen) {
        raspTermEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [raspTermHistory, raspTermOpen]);

  // Handle completion of setup wizard with detected nodes
  const handleSetupComplete = (nodes: ClusterNode[]) => {
      clusterService.setNodes(nodes);
      setIsSetupComplete(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSysStats(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(40, Math.min(60, prev.ram + (Math.random() * 2 - 1))),
        temp: Math.max(38, Math.min(65, prev.temp + (Math.random() * 4 - 2))),
        disk: prev.disk
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openApp = (id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: Math.max(...prev.map(x => x.zIndex)) + 1 };
      }
      return w;
    }));
    setActiveId(id);
  };

  const closeApp = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const minimizeApp = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const bringToFront = (id: AppId) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    setActiveId(id);
  };

  const getWallpaperUrl = () => {
      switch(wallpaper) {
          case 'neon': return "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670')";
          case 'space': return "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672')";
          case 'mesh': return "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')";
          default: return "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')";
      }
  };

  const toggleOS = async () => {
    // 1. Initiate Shutdown Sequence
    setTransitionState('shutting-down');
    await new Promise(r => setTimeout(r, 1500)); // Simulated screen off delay

    // 2. Start Boot Sequence (Hypervisor Logic)
    setTransitionState('booting');
    setBootLog([
      "ACPI: Initiating Hypervisor Context Switch",
      "XEN: Suspending DomU [PiNet_Web3_OS]",
      "VMM: Saving CPU State to NVMe Region 0x8000...",
    ]);

    const target = currentOS === 'pinet' ? 'raspbian' : 'pinet';
    
    // Animate loglines
    setTimeout(() => setBootLog(prev => [...prev, "VMM: CPU State Saved. (128ms)"]), 800);
    setTimeout(() => setBootLog(prev => [...prev, `HYPERVISOR: Loading Kernel Image: ${target}_kernel.img`]), 1600);
    setTimeout(() => setBootLog(prev => [...prev, "BOOT: Verifying SHA256 Checksum... OK"]), 2400);
    setTimeout(() => setBootLog(prev => [...prev, `INIT: Starting ${target === 'raspbian' ? 'Debian 13 (Trixie) Pixel Desktop' : 'PiNet Web3 Compositor'}...`]), 3200);

    await systemService.executeHypervisorSwitch(target);
    
    // 3. Complete Switch
    setCurrentOS(prev => prev === 'pinet' ? 'raspbian' : 'pinet');
    setTransitionState('idle');
    setBootLog([]);
    setRaspMenuOpen(false); // Reset menu state
    if (target === 'raspbian') setRaspTermOpen(true);
  };

  // Raspbian Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
        x: e.clientX - termPos.x,
        y: e.clientY - termPos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
        setTermPos({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Raspbian Terminal Logic
  const handleRaspTermSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = raspTermInput.trim();
      const newHistory = [...raspTermHistory, `pi@raspberrypi:~ $ ${cmd}`];
      
      if (cmd === 'clear') {
          setRaspTermHistory([]);
          setRaspTermInput('');
          return;
      }

      let output = '';
      switch(cmd) {
        case 'help': 
            output = "GNU bash, version 5.1.16(1)-release (aarch64-unknown-linux-gnu)\nShell Commands: ls, uname, cat, clear, reboot, exit, whoami, pwd"; 
            break;
        case 'uname':
        case 'uname -a': 
            output = "Linux raspberrypi 6.5.0-rpi-v8 #1 SMP PREEMPT Debian 13 (trixie) aarch64 GNU/Linux"; 
            break;
        case 'ls': 
            output = "Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos"; 
            break;
        case 'whoami': 
            output = "pi"; 
            break;
        case 'pwd': 
            output = "/home/pi"; 
            break;
        case 'cat /etc/os-release':
            output = "PRETTY_NAME=\"Debian GNU/Linux 13 (trixie)\"\nNAME=\"Debian GNU/Linux\"\nVERSION_CODENAME=trixie";
            break;
        case 'reboot': 
            output = "Rebooting system into Hypervisor context...";
            setTimeout(toggleOS, 1500); 
            break;
        case 'exit': 
            setRaspTermOpen(false); 
            setRaspTermInput('');
            return;
        default: 
            if (cmd) output = `bash: ${cmd}: command not found`;
      }

      if (output) newHistory.push(output);
      setRaspTermHistory(newHistory);
      setRaspTermInput('');
  };

  if (!isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  // Hypervisor Switching State
  if (transitionState !== 'idle') {
      return (
          <div className="w-screen h-screen bg-black flex flex-col items-center justify-center font-mono text-white p-10 relative overflow-hidden">
             {/* CRT shutdown effect simulation */}
             {transitionState === 'shutting-down' && (
               <div className="absolute inset-0 bg-black z-50 animate-out fade-out duration-1000 flex items-center justify-center">
                   <div className="w-full h-0.5 bg-white shadow-[0_0_20px_10px_rgba(255,255,255,0.8)] animate-[ping_0.5s_ease-out_reverse]" />
               </div>
             )}
             
             {transitionState === 'booting' && (
                <div className="w-full max-w-2xl space-y-2 z-40">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-8 h-8 bg-white/10 animate-spin" />
                        <h2 className="text-xl font-bold tracking-widest text-pink-500">RPI5 HYPERVISOR // BOOTLOADER v2.4</h2>
                    </div>
                    {bootLog.map((log, i) => (
                    <div key={i} className="text-sm text-slate-400 border-l-2 border-slate-700 pl-3">
                        <span className="text-slate-600 mr-4">[{ (0.45 + (i * 0.3)).toFixed(6) }]</span>
                        {log}
                    </div>
                    ))}
                    <div className="animate-pulse text-pink-500 mt-4">_</div>
                </div>
             )}
          </div>
      );
  }

  // Raspbian Desktop Render
  if (currentOS === 'raspbian') {
    return (
        <div 
            className="w-screen h-screen bg-slate-300 relative overflow-hidden font-sans selection:bg-red-200 cursor-default animate-in fade-in duration-1000"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
             {/* Wallpaper */}
            <div className="absolute inset-0 bg-[url('https://www.raspberrypi.com/app/uploads/2018/03/RPi-Logo-Reg-SCREEN.png')] bg-center bg-no-repeat bg-white opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2400')] bg-cover opacity-90" />

            {/* Top Panel */}
            <div className="absolute top-0 w-full h-8 bg-slate-200 shadow-md flex items-center justify-between px-2 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setRaspMenuOpen(!raspMenuOpen)}
                        className={`flex items-center gap-2 px-2 py-1 hover:bg-slate-300 rounded transition-colors ${raspMenuOpen ? 'bg-slate-300 shadow-inner' : ''}`}
                    >
                        <img src="https://assets.raspberrypi.com/static/raspberry-pi-logo-f6334c9c27b0b8d5a1900115d7f1c9c8.svg" className="w-5 h-5" alt="Pi" />
                        <span className="text-sm font-bold text-slate-700">Menu</span>
                    </button>
                    <div className="w-px h-4 bg-slate-400" />
                    <button className="p-1 hover:bg-slate-300 rounded" title="Web Browser">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    </button>
                    <button className="p-1 hover:bg-slate-300 rounded" title="File Manager">
                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
                    </button>
                    <button 
                        onClick={() => setRaspTermOpen(!raspTermOpen)}
                        className={`p-1 hover:bg-slate-300 rounded ${raspTermOpen ? 'bg-slate-300' : ''}`} 
                        title="Terminal"
                    >
                        <svg className="w-4 h-4 text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4z"/><path d="M6 10l4 4-4 4v-8zm6 6h6v2h-6v-2z"/></svg>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleOS} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded shadow hover:bg-red-500 transition-colors animate-pulse">
                        Return to PiNet OS
                    </button>
                    <span className="text-xs font-medium text-slate-700">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Start Menu Overlay */}
            {raspMenuOpen && (
                <div className="absolute top-9 left-2 w-56 bg-slate-100 rounded-lg shadow-xl border border-slate-300 z-50 flex flex-col py-1 text-sm text-slate-700">
                    <div className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                        <span>Programming</span>
                    </div>
                    <div className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        <span>Internet</span>
                    </div>
                    <div className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                        <span>Sound & Video</span>
                    </div>
                    <div className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span>Accessories</span>
                    </div>
                    <div className="h-px bg-slate-300 my-1" />
                    <div className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        <span>Shutdown</span>
                    </div>
                </div>
            )}

            {/* Desktop Icons */}
            <div className="p-6 mt-8 grid gap-6 w-fit absolute top-0 left-0">
                <div className="flex flex-col items-center gap-1 group cursor-pointer hover:bg-white/10 p-2 rounded">
                    <div className="w-12 h-12 bg-slate-200 rounded p-2 shadow border border-slate-300 group-hover:bg-slate-100">
                        <svg className="w-full h-full text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    </div>
                    <span className="text-xs text-white font-bold drop-shadow-md bg-slate-900/50 px-1 rounded">Trash</span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-pointer hover:bg-white/10 p-2 rounded">
                    <div className="w-12 h-12 bg-slate-200 rounded p-2 shadow border border-slate-300 group-hover:bg-slate-100">
                        <svg className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                    </div>
                    <span className="text-xs text-white font-bold drop-shadow-md bg-slate-900/50 px-1 rounded">Documents</span>
                </div>
            </div>

            {/* Interactive Terminal Window */}
            {raspTermOpen && (
                <div 
                    style={{ left: termPos.x, top: termPos.y }}
                    className="absolute w-[600px] h-[400px] bg-black rounded-t-lg shadow-2xl border border-slate-600 font-mono text-sm flex flex-col"
                >
                    <div 
                        onMouseDown={handleMouseDown}
                        className="bg-slate-300 px-2 py-1 flex justify-between items-center rounded-t-lg cursor-move select-none active:bg-slate-400 transition-colors"
                    >
                        <span className="text-xs font-bold text-slate-700">pi@raspberrypi: ~</span>
                        <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => setRaspTermOpen(false)}
                                className="w-3 h-3 rounded-full bg-slate-400 hover:bg-slate-500" 
                            />
                            <button className="w-3 h-3 rounded-full bg-slate-400 hover:bg-slate-500" />
                            <button 
                                onClick={() => setRaspTermOpen(false)}
                                className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500" 
                            />
                        </div>
                    </div>
                    <div className="p-2 text-green-400 flex-1 overflow-auto cursor-text" onClick={() => raspTermInputRef.current?.focus()}>
                        {raspTermHistory.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap leading-relaxed">{line}</div>
                        ))}
                        <form onSubmit={handleRaspTermSubmit} className="flex gap-0 group">
                             <span className="text-green-400 shrink-0 font-bold select-none mr-2">pi@raspberrypi:~ $</span>
                             <input 
                                ref={raspTermInputRef}
                                autoFocus
                                className="flex-1 bg-transparent border-none outline-none text-white caret-white"
                                value={raspTermInput}
                                onChange={e => setRaspTermInput(e.target.value)}
                                spellCheck={false}
                                autoComplete="off"
                             />
                        </form>
                        <div ref={raspTermEndRef} />
                    </div>
                </div>
            )}
        </div>
    );
  }

  // PiNet Desktop
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none transition-all duration-700 animate-in fade-in zoom-in-95 duration-700"
         style={{ 
             backgroundImage: wallpaper !== 'carbon' ? getWallpaperUrl() : 'none',
             backgroundSize: 'cover',
             backgroundPosition: 'center'
         }}>
      {wallpaper === 'carbon' && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      )}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,26,74,0.1),rgba(0,0,0,0))]" />
      
      <TopBar nodeStats={nodeStats} systemStats={sysStats} onSwitchOS={toggleOS} currentOS={currentOS} />

      <main className="flex-1 relative overflow-hidden p-6 mt-10 mb-16">
        <Desktop openApp={openApp} />
        
        {windows.map(win => {
          if (!win.isOpen) return null;
          
          return (
            <div 
              key={win.id}
              style={{ zIndex: win.zIndex, display: win.isMinimized ? 'none' : 'block' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[75vh]"
            >
              <WindowContainer 
                title={win.title} 
                onClose={() => closeApp(win.id)}
                onMinimize={() => minimizeApp(win.id)}
                onFocus={() => bringToFront(win.id)}
                isActive={activeId === win.id}
              >
                {win.id === 'minima-node' && <MinimaNodeApp stats={nodeStats} />}
                {win.id === 'system-monitor' && <SystemMonitorApp stats={sysStats} />}
                {win.id === 'terminal' && <TerminalApp />}
                {win.id === 'ai-assistant' && (
                  <AiAssistantApp 
                    context={{ 
                      node: nodeStats, 
                      cluster: clusterNodes, 
                      telemetry: sysStats,
                      timestamp: new Date().toISOString()
                    }} 
                  />
                )}
                {win.id === 'wallet' && <WalletApp />}
                {win.id === 'maxima-messenger' && <MaximaMessengerApp />}
                {win.id === 'cluster-manager' && <ClusterManagerApp nodes={clusterNodes} />}
                {win.id === 'depai-executor' && <DePAiExecutor nodes={clusterNodes} />}
                {win.id === 'imager-utility' && <ImagerUtility />}
                {win.id === 'file-explorer' && <FileExplorerApp />}
                {win.id === 'settings' && <SettingsApp />}
                {win.id === 'visual-studio' && <VisualAssetStudio />}
              </WindowContainer>
            </div>
          );
        })}
      </main>

      <Taskbar 
        windows={windows} 
        activeId={activeId} 
        onAppClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (win?.isMinimized || !win?.isOpen) {
            openApp(id);
          } else if (activeId === id) {
            minimizeApp(id);
          } else {
            bringToFront(id);
          }
        }} 
      />
    </div>
  );
};

export default App;
