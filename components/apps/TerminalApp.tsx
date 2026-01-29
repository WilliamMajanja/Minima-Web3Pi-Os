
import React, { useState, useEffect, useRef } from 'react';

type LineType = 'header' | 'prompt' | 'info' | 'success' | 'error' | 'command' | 'code' | 'warning';

interface TerminalLine {
  text: string;
  type: LineType;
}

const COMMANDS = [
  'help', 
  'status', 
  'peers', 
  'balance', 
  'clear', 
  'reboot', 
  'cluster list', 
  'm402 status',
  'maxima info',
  'node version'
];

const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'PiNet Web3 OS Shell [Version 1.0.35]', type: 'header' },
    { text: '(c) 2024 Minima Global. Decentralized Node Environment.', type: 'info' },
    { text: '', type: 'info' },
    { text: 'Welcome, Agent. Type "help" to list available protocols.', type: 'info' },
    { text: '', type: 'info' }
  ]);
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const trimmedInput = input.trim().toLowerCase();
    if (trimmedInput) {
      const match = COMMANDS.find(cmd => cmd.startsWith(trimmedInput));
      if (match && match !== trimmedInput) {
        // Only suggest if the match is longer than input
        setSuggestion(match.slice(input.length));
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setInput(input + suggestion);
      setSuggestion('');
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = input.trim();
    const cmd = rawCmd.toLowerCase();
    if (!cmd) return;

    const newHistory: TerminalLine[] = [{ text: `pinet@raspberrypi:~$ ${rawCmd}`, type: 'prompt' }];

    switch (cmd) {
      case 'help':
        newHistory.push(
          { text: 'SYSTEM COMMANDS:', type: 'header' },
          { text: '  status         - Core node health & sync state', type: 'info' },
          { text: '  peers          - Global P2P connection topology', type: 'info' },
          { text: '  balance        - M.402 Wallet & Token metrics', type: 'info' },
          { text: '  clear          - Flush shell buffer', type: 'info' },
          { text: '  reboot         - Thermal-safe cluster restart', type: 'info' },
          { text: '  cluster list   - Show sharded Pi nodes', type: 'info' },
          { text: '  m402 status    - Active agentic billing streams', type: 'info' }
        );
        break;
      case 'status':
        newHistory.push(
          { text: 'NODE IDENTIFIER: 0x7471...F2E9', type: 'info' },
          { text: 'NETWORK STATUS: [ ONLINE ]', type: 'success' },
          { text: 'SYNC PROGRESS: 100.00% (Block 1,245,092)', type: 'success' },
          { text: 'PROTOCOL: Minima Mainnet v1.0.35', type: 'info' }
        );
        break;
      case 'peers':
        newHistory.push(
          { text: 'DISCOVERING PEERS...', type: 'info' },
          { text: 'CONNECTED: 14 Nodes', type: 'success' },
          { text: 'LATENCY: 42ms (Average)', type: 'info' },
          { text: 'TOPOLOGY: Sharded P2P Mesh', type: 'warning' }
        );
        break;
      case 'balance':
        newHistory.push(
          { text: 'AVAILABLE: 1,250.45 MIN', type: 'success' },
          { text: 'STAKED: 5,000.00 MIN', type: 'info' },
          { text: 'M.402 BURN RATE: 0.042 MIN/hour', type: 'warning' }
        );
        break;
      case 'cluster list':
        newHistory.push(
          { text: 'ID      ROLE      STATUS    HAT', type: 'header' },
          { text: 'n1      Alpha     ONLINE    SSD_NVME', type: 'info' },
          { text: 'n2      Beta      ONLINE    AI_NPU', type: 'info' },
          { text: 'n3      Gamma     ONLINE    SENSE', type: 'info' }
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'reboot':
        newHistory.push(
          { text: 'Initiating safe cluster shutdown...', type: 'warning' },
          { text: 'Flushing cache to NVMe...', type: 'info' },
          { text: 'Broadcast signal sent to nodes n2, n3.', type: 'info' },
          { text: 'Rebooting Kernel...', type: 'info' },
          { text: 'System back online.', type: 'success' }
        );
        break;
      case 'node version':
        newHistory.push({ text: 'PiNet Web3 OS v1.0.35-stable (aarch64)', type: 'code' });
        break;
      default:
        newHistory.push({ text: `pinet: command not found: ${rawCmd}`, type: 'error' });
    }

    setHistory(prev => [...prev, ...newHistory]);
    setInput('');
  };

  const getLineStyles = (type: LineType) => {
    switch (type) {
      case 'header': return 'text-white font-bold tracking-tight border-l-2 border-white/20 pl-2 my-1';
      case 'prompt': return 'text-blue-400 font-bold drop-shadow-[0_0_3px_rgba(96,165,250,0.5)]';
      case 'info': return 'text-slate-400';
      case 'success': return 'text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.3)]';
      case 'error': return 'text-rose-400 font-medium italic';
      case 'warning': return 'text-amber-400 italic';
      case 'code': return 'text-indigo-400 bg-indigo-500/5 px-1 rounded';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] font-mono text-xs sm:text-sm p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent)]" />
      
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-1 relative z-10 custom-terminal-scrollbar selection:bg-blue-500/30">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-left-2 ${getLineStyles(line.type)}`}>
            {line.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="mt-4 flex gap-2 border-t border-white/5 pt-4 group relative z-10">
        <span className="text-blue-400 shrink-0 font-bold select-none">pinet@raspberrypi:~$</span>
        <div className="relative flex-1 min-w-0">
          <input 
            autoFocus
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-white caret-pink-500 selection:bg-pink-500/30"
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          {suggestion && (
            <span className="absolute left-0 top-0 pointer-events-none text-slate-600 opacity-60 italic">
              <span className="invisible whitespace-pre">{input}</span>
              {suggestion}
            </span>
          )}
        </div>
        {suggestion && (
          <span className="hidden sm:block text-[9px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity self-center">
            [Tab]
          </span>
        )}
      </form>
    </div>
  );
};

export default TerminalApp;
