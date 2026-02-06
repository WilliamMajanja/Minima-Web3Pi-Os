
import { ClusterNode } from '../types';

type Listener = () => void;

class ClusterServiceImpl {
  private listeners: Listener[] = [];
  private _nodes: ClusterNode[] = [
    { 
        id: 'n1', 
        name: 'Pi-Alpha (Local Host)', 
        ip: '127.0.0.1', 
        hat: 'SSD_NVME', 
        status: 'online', 
        metrics: { cpu: 12, ram: 2.1, temp: 45, iops: 12500 } 
    }
  ];

  constructor() {
    // Simulate metrics fluctuation
    setInterval(() => {
        this._nodes = this._nodes.map(node => ({
            ...node,
            metrics: {
                ...node.metrics,
                cpu: Math.max(5, Math.min(100, node.metrics.cpu + (Math.random() * 10 - 5))),
                temp: Math.max(30, Math.min(80, node.metrics.temp + (Math.random() * 4 - 2))),
            }
        }));
        this.emit();
    }, 2000);
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit() { this.listeners.forEach(l => l()); }

  get nodes() { return this._nodes; }

  addNode(node: ClusterNode) {
      if (!this._nodes.find(n => n.id === node.id)) {
          this._nodes.push(node);
          this.emit();
      }
  }

  setNodes(nodes: ClusterNode[]) {
      this._nodes = nodes;
      this.emit();
  }

  provisionNode(id: string) {
      const node = this._nodes.find(n => n.id === id);
      if (node) {
          node.status = 'provisioning';
          this.emit();
          setTimeout(() => {
              node.status = 'online';
              this.emit();
          }, 5000);
      }
  }
}

export const clusterService = new ClusterServiceImpl();
