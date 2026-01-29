import React from 'react';

const WalletApp: React.FC = () => {
  const transactions = [
    { id: 1, type: 'M.402 Burn', amount: '-0.42 MIN', date: 'Just now', status: 'Agent: Llama-3-Pi' },
    { id: 2, type: 'Received', amount: '+42.50 MIN', date: '2024-05-20', status: 'Confirmed' },
    { id: 3, type: 'Sent', amount: '-10.00 MIN', date: '2024-05-18', status: 'Confirmed' },
    { id: 4, type: 'Staking Reward', amount: '+0.15 MIN', date: '2024-05-17', status: 'Confirmed' },
  ];

  return (
    <div className="p-8 h-full flex flex-col gap-8 overflow-y-auto">
      <div className="bg-gradient-to-br from-amber-500 to-orange-700 p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between h-64 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Mainnet Assets</span>
          <div className="text-5xl font-bold text-white mt-2 flex items-baseline gap-2">
            1,250.45 
            <span className="text-xl font-medium opacity-60">MIN</span>
          </div>
        </div>
        <div className="flex justify-between items-end relative z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-white/50 uppercase mb-1">Minima Address</span>
            <div className="text-xs font-mono font-medium text-white/80 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">Mx00A1...E94F</div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all border border-white/20 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Send
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-2xl text-xs font-bold transition-all hover:bg-orange-50 active:scale-95 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                Receive
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Transaction History</h3>
            <button className="text-[10px] text-blue-400 font-bold uppercase tracking-wider hover:text-blue-300">View All</button>
        </div>
        <div className="flex-1 overflow-auto space-y-3 pr-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl glass-dark border border-white/5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.type.includes('Burn') ? 'bg-orange-500/10 text-orange-500' :
                    tx.type === 'Sent' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {tx.type.includes('Burn') ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path d="M9.879 16.121A3 3 0 1012.015 11L11 14l.879 2.121z"/></svg>
                  ) : tx.type === 'Sent' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                  ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 7L7.8 16.2M7 7v10h10"/></svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{tx.type}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-mono font-bold ${
                    tx.type === 'Sent' || tx.type.includes('Burn') ? 'text-rose-400' : 'text-emerald-400'
                }`}>{tx.amount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletApp;