
import React, { useState, useEffect, useRef } from 'react';

const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<string[]>([
    'Minima Node Management Shell [Version 1.0.35]',
    '(c) 2024 Minima Global. All rights reserved.',
    '',
    'Type "help" for a list of commands.',
    ''
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let response = [`pinet@raspberrypi:~$ ${input}`];

    switch (cmd) {
      case 'help':
        response.push('Available commands:', '  status  - Show node status', '  peers   - List connected nodes', '  balance - Show wallet balance', '  clear   - Clear terminal', '  reboot  - Restart the node service');
        break;
      case 'status':
        response.push('Node Status: RUNNING', 'Chain Height: 1,245,092', 'Network: MAINNET');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'reboot':
        response.push('Rebooting node service...', 'Stopping Minima...', 'Starting Minima...', 'Node online.');
        break;
      default:
        response.push(`Command not found: ${cmd}`);
    }

    setHistory(prev => [...prev, ...response]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black/80 font-mono text-sm p-4 text-emerald-500">
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="mt-4 flex gap-2">
        <span className="text-blue-400">pinet@raspberrypi:~$</span>
        <input 
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-emerald-500"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </form>
    </div>
  );
};

export default TerminalApp;
