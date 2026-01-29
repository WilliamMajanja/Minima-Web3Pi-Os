
import React, { useState, useEffect, useRef } from 'react';

type LineType = 'header' | 'prompt' | 'info' | 'success' | 'error' | 'command';

interface TerminalLine {
  text: string;
  type: LineType;
}

const COMMANDS = ['help', 'status', 'peers', 'balance', 'clear', 'reboot'];

const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'Minima Node Management Shell [Version 1.0.35]', type: 'header' },
    { text: '(c) 2024 Minima Global. All rights reserved.', type: 'info' },
    { text: '', type: 'info' },
    { text: 'Type "help" for a list of commands.', type: 'info' },
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
    if (input.trim()) {
      const match = COMMANDS.find(cmd => cmd.startsWith(input.toLowerCase()));
      if (match && match !== input.toLowerCase()) {
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
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newHistory: TerminalLine[] = [{ text: `pinet@raspberrypi:~$ ${input}`, type: 'prompt' }];

    switch (cmd) {
      case 'help':
        newHistory.push(
          { text: 'Available commands:', type: 'info' },
          { text: '  status  - Show node status', type: 'info' },
          { text: '  peers   - List connected nodes', type: 'info' },
          { text: '  balance - Show wallet balance', type: 'info' },
          { text: '  clear   - Clear terminal', type: 'info' },
          { text: '  reboot  - Restart the node service', type: 'info' }
        );
        break;
      case 'status':
        newHistory.push(
          { text: 'Node Status: ', type: 'info' },
          { text: 'RUNNING', type: 'success' },
          { text: 'Chain Height: 1,245,092', type: 'info' },
          { text: 'Network: MAINNET', type: 'info' }
        );
        break;
      case 'peers':
        newHistory.push(
          { text: 'Scanning network...', type: 'info' },
          { text: 'Connected to 14 peers across DePIN shards.', type: 'success' }
        );
        break;
      case 'balance':
        newHistory.push(
          { text: 'Wallet Balance:', type: 'info' },
          { text: '1,250.45 MIN', type: 'success' }
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'reboot':
        newHistory.push(
          { text: 'Rebooting node service...', type: 'info' },
          { text: 'Stopping Minima...', type: 'info' },
          { text: 'Starting Minima...', type: 'info' },
          { text: 'Node online.', type: 'success' }
        );
        break;
      default:
        newHistory.push({ text: `Command not found: ${cmd}`, type: 'error' });
    }

    setHistory(prev => [...prev, ...newHistory]);
    setInput('');
  };

  const getLineColor = (type: LineType) => {
    switch (type) {
      case 'header': return 'text-white font-bold';
      case 'prompt': return 'text-blue-400 font-bold';
      case 'info': return 'text-slate-400';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400';
      case 'command': return 'text-white';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/90 font-mono text-xs sm:text-sm p-5 text-slate-300 overflow-hidden shadow-inner">
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-1 selection:bg-blue-500/30">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${getLineColor(line.type)}`}>
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="mt-4 flex gap-2 border-t border-white/5 pt-3 group">
        <span className="text-blue-400 shrink-0 font-bold">pinet@raspberrypi:~$</span>
        <div className="relative flex-1 min-w-0">
          <input 
            autoFocus
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-white caret-pink-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          {suggestion && (
            <span className="absolute left-0 top-0 pointer-events-none text-slate-600">
              <span className="invisible">{input}</span>
              {suggestion}
            </span>
          )}
        </div>
        {suggestion && (
          <span className="hidden sm:block text-[9px] font-bold text-slate-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
            [Tab] to complete
          </span>
        )}
      </form>
    </div>
  );
};

export default TerminalApp;
