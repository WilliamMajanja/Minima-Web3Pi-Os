
import { NodeStats } from '../types';

type Listener = () => void;

class MinimaServiceImpl {
  private listeners: Listener[] = [];
  private _balance = 1250.45;
  private _blockHeight = 1245091;
  private _transactions: any[] = [
      { id: 1, type: 'Received', amount: '+42.50 MIN', date: '2024-05-20', status: 'Confirmed' },
      { id: 2, type: 'Sent', amount: '-10.00 MIN', date: '2024-05-18', status: 'Confirmed' },
      { id: 3, type: 'Staking Reward', amount: '+0.15 MIN', date: '2024-05-17', status: 'Confirmed' },
  ];
  private _stats: NodeStats = {
    blockHeight: 1245091,
    peers: 14,
    status: 'Synced',
    uptime: '14d 05h 22m',
    version: '1.0.35'
  };

  constructor() {
    // Simulate block production
    setInterval(() => {
        this._blockHeight++;
        this._stats.blockHeight = this._blockHeight;
        this.emit();
    }, 6000);
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit() { this.listeners.forEach(l => l()); }

  get balance() { return this._balance; }
  get transactions() { return this._transactions; }
  get stats() { return this._stats; }

  burn(amount: number, description: string) {
    this._balance = Math.max(0, this._balance - amount);
    // Only add transaction log occasionally to avoid spamming the list in UI during streaming
    if (Math.random() > 0.95) {
        this._transactions.unshift({
            id: Date.now(),
            type: 'M.402 Burn',
            amount: `-${amount.toFixed(4)} MIN`,
            date: 'Just now',
            status: description
        });
    }
    this.emit();
  }

  send(to: string, amount: number) {
      if (amount > this._balance) return false;
      this._balance -= amount;
      this._transactions.unshift({
          id: Date.now(),
          type: 'Sent',
          amount: `-${amount.toFixed(2)} MIN`,
          date: 'Just now',
          status: 'Pending'
      });
      this.emit();
      return true;
  }

  // Legacy static methods adapted to use instance if needed, or kept for compatibility
  async cmd(command: string): Promise<any> {
    console.log(`[Minima Cluster CMD]: ${command}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (command === "status") {
          resolve({ status: true, response: { version: "1.0.35", network: "mainnet", block: this._blockHeight } });
        } else if (command.startsWith("m402")) {
          resolve({ status: true, response: { contract: "0xM402_AGENT_PAY", state: "STREAMING" } });
        }
        resolve({ status: true, response: {} });
      }, 100);
    });
  }

  async initiateM402Stream(rate: number): Promise<string> {
    const sessionId = `M402-${Math.random().toString(36).substr(2, 9)}`;
    await this.cmd(`m402 create session:${sessionId} rate:${rate} target:cluster_pool`);
    return sessionId;
  }

  async stopM402Stream(sessionId: string): Promise<void> {
    await this.cmd(`m402 close session:${sessionId}`);
  }

  async sendMaximaMessage(to: string, application: string, data: any): Promise<boolean> {
    const jsonStr = JSON.stringify(data);
    const command = `maxima send to:${to} application:${application} data:${jsonStr}`;
    const result = await this.cmd(command);
    return result.status;
  }
}

export const minimaService = new MinimaServiceImpl();
export const MinimaService = minimaService; // Export as singleton instance but keep compatibility
