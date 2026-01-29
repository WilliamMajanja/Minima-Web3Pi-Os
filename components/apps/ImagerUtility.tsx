
import React, { useState } from 'react';

const ImagerUtility: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const imagerJson = `{
  "os_list": [
    {
      "name": "Web3PiOS",
      "description": "Native Web3 & Minima Protocol Cluster Distribution",
      "icon": "https://web3pi.os/icon.png",
      "url": "https://downloads.web3pi.os/web3pios-v1.0.35-64bit.img.xz",
      "extract_size": 4294967296,
      "extract_sha256": "8f3e...",
      "image_download_size": 1073741824,
      "release_date": "2024-05-22",
      "devices": ["pi4-64bit", "pi5-64bit"]
    }
  ]
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imagerJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-8 h-full flex flex-col gap-8 overflow-y-auto">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-900/20">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z"/><path d="M7 12h.01"/><path d="M11 12h.01"/><path d="M15 12h.01"/><path d="M22 15V9"/></svg>
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Pi Imager Portal</h1>
          <p className="text-slate-400 font-medium">Provision SD Cards for Global Cluster Deployment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 space-y-6">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Image Preparation
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
               <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Build Target</div>
               <div className="text-white font-bold">Web3PiOS v1.0.35 (64-bit Core)</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
               <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Pre-Configured Cluster ID</div>
               <div className="text-emerald-400 font-mono text-sm">pinet-node-alpha-772-xf2</div>
            </div>
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Build Custom .IMG
            </button>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Imager os_list.json</h3>
            <button 
              onClick={copyToClipboard}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
            >
              {isCopied ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>
          <div className="flex-1 bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-emerald-500 overflow-auto border border-white/5 leading-relaxed">
            <pre>{imagerJson}</pre>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/20 to-transparent p-8 rounded-[2.5rem] border border-emerald-500/20">
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="shrink-0 w-20 h-20 bg-white p-3 rounded-2xl shadow-xl">
              <img src="https://www.raspberrypi.com/app/uploads/2020/03/raspberry-pi-imager-logo.png" alt="Pi Imager" className="w-full h-full object-contain" />
           </div>
           <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Feature in Official Imager</h4>
              <p className="text-slate-400 text-sm max-w-xl">This utility allows you to package Web3PiOS with local cluster secrets embedded. Users can then select Web3PiOS directly from the <strong>"Other specific-purpose OS"</strong> category in the Pi Imager software.</p>
           </div>
           <div className="md:ml-auto">
              <button className="px-6 py-3 border border-white/20 hover:border-white/40 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest">
                Documentation
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImagerUtility;
