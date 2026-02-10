
import React, { useState, useEffect, useRef } from 'react';
import { shell } from '../../services/shellService';

type LineType = 'header' | 'prompt' | 'info' | 'success' | 'error' | 'command' | 'code' | 'warning';

interface TerminalLine {
  text: string;
  type: LineType;
}

const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'Linux raspberrypi 6.5.0-rpi-v8 #1 SMP PREEMPT Debian 13 (trixie) aarch64', type: 'info' },
    { text: '', type: 'info' },
    { text: 'The programs included with the Debian GNU/Linux system are free software;', type: 'info' },
    { text: 'the exact distribution terms for each program are described in the', type: 'info' },
    { text: 'individual files in /usr/share/doc/*/copyright.', type: 'info' },
    { text: '', type: 'info' },
    { text: 'Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent', type: 'info' },
    { text: 'permitted by applicable law.', type: 'info' },
    { text: `Last login: ${new Date().toString().split(' (')[0]}`, type: 'info' },
    { text: '', type: 'info' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const getPrompt = () => {
    const user = shell.getUser();
    const path = shell.getCurrentPath();
    const home = `/home/${user}`;
    
    let displayPath = path;
    if (path === home) {
        displayPath = '~';
    } else if (path.startsWith(home + '/')) {
        displayPath = '~' + path.slice(home.length);
    }
    
    return `${user}@raspberrypi:${displayPath}$`;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;

    if (rawInput === 'clear') {
        setHistory([]);
        setInput('');
        return;
    }

    const promptLine: TerminalLine = { 
        text: `${getPrompt()} ${rawInput}`, 
        type: 'prompt' 
    };
    
    const result = shell.execute(rawInput);
    
    setHistory(prev => [...prev, promptLine, ...result.output]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const commands = [
        'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'whoami', 'uname', 
        'clear', 'neofetch', 'apt', 'sudo', 'reboot', 'minima', 'cluster', 'top', 'help'
      ];
      
      const currentInput = input;
      // Only complete command if it's the start
      if (!currentInput.includes(' ') && currentInput.length > 0) {
          const matches = commands.filter(cmd => cmd.startsWith(currentInput));
          
          if (matches.length === 1) {
              setInput(matches[0] + ' ');
          } else if (matches.length > 1) {
              // Calculate common prefix
              const commonPrefix = matches.reduce((acc, str) => {
                  let i = 0;
                  while (i < acc.length && i < str.length && acc[i] === str[i]) i++;
                  return acc.slice(0, i);
              }, matches[0]);

              if (commonPrefix.length > currentInput.length) {
                  setInput(commonPrefix);
              } else {
                  // If we are already at common prefix, list options
                  setHistory(prev => [
                      ...prev,
                      { text: `${getPrompt()} ${currentInput}`, type: 'prompt' },
                      { text: matches.join('  '), type: 'info' }
                  ]);
              }
          }
      }
    }
  };

  const getLineStyles = (type: LineType) => {
    switch (type) {
      case 'header': return 'text-white font-bold tracking-tight border-l-2 border-white/20 pl-2 my-1';
      case 'prompt': return 'text-emerald-400 font-bold';
      case 'info': return 'text-slate-300';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400 font-medium';
      case 'warning': return 'text-amber-400 italic';
      case 'code': return 'text-indigo-300 bg-white/5 px-1 rounded font-mono';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] font-mono text-xs sm:text-sm p-4 overflow-hidden" onClick={() => document.getElementById('term-input')?.focus()}>
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-0.5 relative z-10 selection:bg-white/20">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-tight break-words ${getLineStyles(line.type)}`}>
            {line.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="mt-2 flex gap-0 group relative z-10">
        <span className="text-emerald-400 shrink-0 font-bold select-none mr-2">
            {getPrompt()}
        </span>
        <input 
          id="term-input"
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-white caret-slate-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default TerminalApp;
