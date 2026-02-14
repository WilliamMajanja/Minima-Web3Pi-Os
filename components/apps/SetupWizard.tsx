
import React, { useState, useEffect, useRef } from 'react';
import { ClusterNode } from '../../types';
import { systemService } from '../../services/systemService';

interface SetupWizardProps {
  onComplete: (nodes: ClusterNode[]) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [provisionLog, setProvisionLog] = useState<string[]>([]);
  const [nodesFound, setNodesFound] = useState<ClusterNode[]>([
      { id: 'n1', name: 'Pi-Alpha (Local)', ip: '127.0.0.1', hat: 'SSD_NVME', status: 'online', metrics: { cpu: 12, ram: 2.1, temp: 45, iops: 12500 } }
  ]);
  const provLogRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: "Welcome to PiNet Web3 OS",
      description: "The official Web3 distribution for Raspberry Pi by Minima. We'll help you configure your decentralized node.",
      icon: "🚀"
    },
    {
      title: "Initializing Minima Protocol",
      description: "Starting Alpha Node Protocol Service. Establishing Master Identity on the network.",
      icon: "🌐"
    },
    {
      title: "Network Discovery",
      description: `Scanning local subnet for Raspberry Pi peers via PXE/ICMP.`,
      icon: "📡"
    },
    {
      title: "Cluster Synchronization",
      description: `Provisioning ${nodesFound.length - 1} Worker Nodes. The Alpha node will serve the OS image to Beta & Gamma units via PXE.`,
      icon: "🔌"
    },
    {
      title: "Agentic Payments (M.402)",
      description: "Setting up the M.402 payment stream system for autonomous resource management.",
      icon: "💎"
    }
  ];

  const prevStep = () => {
      if (step > 0 && !loading) {
          setStep(step - 1);
      }
  };

  const restartOnboarding = () => {
      setStep(0);
      setNodesFound([{ id: 'n1', name: 'Pi-Alpha (Local)', ip: '127.0.0.1', hat: 'SSD_NVME', status: 'online', metrics: { cpu: 12, ram: 2.1, temp: 45, iops: 12500 } }]);
      setScanLog([]);
      setProvisionLog([]);
  };

  // Simulated peer discovery using SystemService
  const scanForPeers = async () => {
      setLoading(true);
      setScanLog([]);
      
      // Reset to just local before scanning
      setNodesFound([{ id: 'n1', name: 'Pi-Alpha (Local)', ip: '127.0.0.1', hat: 'SSD_NVME', status: 'online', metrics: { cpu: 12, ram: 2.1, temp: 45, iops: 12500 } }]);
      
      const foundNodes = await systemService.scanSubnet('192.168.1.0', (log) => {
          setScanLog(prev => [...prev.slice(-6), log]);
      });

      if (foundNodes.length <= 1) {
         setNodesFound(foundNodes.length > 0 ? foundNodes : [{ id: 'n1', name: 'Pi-Alpha (Local)', ip: '127.0.0.1', hat: 'SSD_NVME', status: 'online', metrics: { cpu: 12, ram: 2.1, temp: 45, iops: 12500 } }]);
      } else {
         setNodesFound(foundNodes);
      }
      
      setLoading(false);
  };

  // Auto-scan on step 2
  useEffect(() => {
    if (step === 2 && nodesFound.length === 1 && !loading && scanLog.length === 0) {
        scanForPeers();
    }
  }, [step]);

  // Auto-Provisioning Sequence on Step 3
  useEffect(() => {
    if (step === 3) {
        const unprovisioned = nodesFound.filter(n => n.status === 'awaiting-os');
        if (unprovisioned.length > 0) {
            runProvisioningSequence(unprovisioned);
        }
    }
  }, [step]);

  // Auto-scroll provision logs
  useEffect(() => {
    if (provLogRef.current) {
        provLogRef.current.scrollTop = provLogRef.current.scrollHeight;
    }
  }, [provisionLog]);

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runProvisioningSequence = async (nodes: ClusterNode[]) => {
      setLoading(true);
      setProvisionLog([]);

      setProvisionLog(prev => [...prev, `[ALPHA] Master Node initializing TFTP Server...`]);
      await wait(800);
      setProvisionLog(prev => [...prev, `[ALPHA] Serving PiNetOS.img (arm64) on 192.168.1.10:69`]);
      await wait(800);

      for (const node of nodes) {
          setProvisionLog(prev => [...prev, `------------------------------------------------`]);
          setProvisionLog(prev => [...prev, `[PXE] DHCP Request received from ${node.name} (${node.ip})`]);
          await wait(600);
          setProvisionLog(prev => [...prev, `[DHCP] Lease Offered: ${node.ip} mask 255.255.255.0`]);
          await wait(600);
          setProvisionLog(prev => [...prev, `[TFTP] Streaming kernel image to ${node.ip}...`]);
          
          setNodesFound(prev => prev.map(n => n.id === node.id ? { ...n, status: 'provisioning' } : n));
          
          // Simulate flash time
          for(let i=0; i<3; i++) {
              await wait(800);
              setProvisionLog(prev => [...prev, `[FLASH] Writing blocks... ${(i+1)*33}%`]);
          }

          setProvisionLog(prev => [...prev, `[BOOT] ${node.name} booting PiNetOS...`]);
          await wait(1000);
          setProvisionLog(prev => [...prev, `[SYNC] Handshake: Minima Protocol active.`]);
          
          setNodesFound(prev => prev.map(n => n.id === node.id ? { ...n, status: 'online' } : n));
          setProvisionLog(prev => [...prev, `[OK] ${node.name} Online & Synced.`]);
      }
      
      setProvisionLog(prev => [...prev, `------------------------------------------------`]);
      setProvisionLog(prev => [...prev, `[CLUSTER] Synchronization Complete. All nodes active.`]);
      setLoading(false);
  };

  const nextStep = () => {
    if (step === 2 && nodesFound.length === 1 && !loading) {
       setStep(step + 1);
       return;
    }

    if (step < steps.length - 1) {
      setLoading(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setLoading(false);
            setStep(step + 1);
            return 100;
          }
          return p + 4; // speed
        });
      }, 40);
    } else {
      onComplete(nodesFound);
    }
  };

  const isScanFailed = step === 2 && nodesFound.length === 1 && !loading && scanLog.length > 0;
  const isProvisioningStep = step === 3;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,26,74,0.15),rgba(0,0,0,0))]" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      
      <div className="max-w-xl w-full glass-dark rounded-[2.5rem] border border-white/10 p-12 relative z-10 shadow-2xl flex flex-col gap-8 text-center transition-all duration-500">
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-pink-500/20 transition-all ${isScanFailed ? 'bg-amber-500' : 'bg-[#C51A4A] animate-bounce'}`}>
            {isScanFailed ? '⚠️' : steps[step].icon}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{isScanFailed ? "Discovery Failed" : steps[step].title}</h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {step === 2 && nodesFound.length === 1 && !loading 
                ? (scanLog.length > 0 ? "We couldn't detect any other nodes on the network. You can retry the scan or continue with a single node." : "Scanning for local cluster peers...") 
                : isProvisioningStep && loading ? "Synchronizing Cluster Topology..." : steps[step].description}
          </p>
          {step === 2 && nodesFound.length > 1 && (
              <p className="text-emerald-400 font-bold animate-pulse">Successfully detected full cluster topology!</p>
          )}
          {step === 3 && !loading && nodesFound.every(n => n.status === 'online') && (
              <p className="text-emerald-400 font-bold animate-pulse">Cluster Synchronized Successfully.</p>
          )}
          {isScanFailed && (
               <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-bold flex flex-col gap-2">
                   <span>No other Pi nodes detected on subnet 192.168.1.x</span>
                   <span className="text-[10px] opacity-70">Check your ethernet switch or wifi credentials.</span>
               </div>
          )}
        </div>

        {step === 2 && loading && scanLog.length > 0 && (
             <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-left h-32 overflow-hidden border border-white/10 shadow-inner">
                 {scanLog.map((log, i) => (
                     <div key={i} className="text-emerald-500/80 mb-1">{log}</div>
                 ))}
                 <div className="animate-pulse text-emerald-500">_</div>
             </div>
        )}

        {isProvisioningStep && provisionLog.length > 0 && (
            <div ref={provLogRef} className="bg-black/40 rounded-xl p-4 font-mono text-xs text-left h-48 overflow-y-auto border border-white/10 shadow-inner scrollbar-hide">
                {provisionLog.map((log, i) => (
                    <div key={i} className={`${log.includes('[OK]') ? 'text-emerald-400' : log.includes('[ALPHA]') ? 'text-pink-400' : 'text-slate-400'} mb-1`}>
                        {log}
                    </div>
                ))}
                {loading && <div className="animate-pulse text-pink-500">_</div>}
            </div>
        )}

        {step === 2 && !loading ? (
             <div className="pt-6 flex flex-col gap-3 justify-center animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-4 justify-center">
                    {nodesFound.length === 1 && (
                        <button 
                            onClick={scanForPeers}
                            className={`px-8 py-4 text-white rounded-2xl text-md font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${
                                scanLog.length > 0 ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40' : 'bg-indigo-600 hover:bg-indigo-500'
                            }`}
                        >
                            {scanLog.length > 0 ? "Retry Scan" : "Scan Subnet"}
                        </button>
                    )}
                    <button 
                        onClick={() => setStep(step + 1)}
                        className={`px-8 py-4 text-white rounded-2xl text-md font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${
                            nodesFound.length === 1 ? 'bg-white/10 hover:bg-white/20 border border-white/10 shadow-none' : 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/40'
                        }`}
                    >
                        {nodesFound.length === 1 ? "Use Single Node" : "Continue"}
                    </button>
                </div>
                {nodesFound.length === 1 && scanLog.length > 0 && (
                    <button 
                        onClick={restartOnboarding}
                        className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest mt-4 border border-white/5 hover:bg-white/5 px-6 py-3 rounded-xl mx-auto block"
                    >
                        Return to Start
                    </button>
                )}
             </div>
        ) : (loading && step !== 2) ? (
          <div className="space-y-4">
            {!isProvisioningStep && (
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-pink-600 transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
            )}
            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.3em]">
                {isProvisioningStep ? "Cluster PXE Sync in Progress..." : "Deploying OS Components..."}
            </p>
          </div>
        ) : loading && step === 2 ? null : (
          <div className="pt-6 flex gap-4 justify-center">
            {step > 0 && (
                <button 
                  onClick={prevStep}
                  disabled={isProvisioningStep && loading}
                  className="px-6 py-5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-lg font-bold uppercase tracking-widest border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  Back
                </button>
            )}
            <button 
              onClick={nextStep}
              disabled={isProvisioningStep && loading}
              className="px-10 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-pink-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {step === steps.length - 1 ? "Launch OS" : "Continue"}
            </button>
          </div>
        )}

        {/* Steps Indicator */}
        <div className="mt-8 flex justify-center gap-2">
            {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-pink-500' : 'w-2 bg-white/10'}`} />
            ))}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <svg className="w-4 h-4 text-[#C51A4A]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
          PiNet Web3 OS Core
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
