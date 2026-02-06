
type Listener = () => void;

class SettingsServiceImpl {
  private listeners: Listener[] = [];
  private _wallpaper = 'carbon';
  private _nodeAlias = 'Pi-Alpha-Node';
  private _torEnabled = false;

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit() { this.listeners.forEach(l => l()); }

  get wallpaper() { return this._wallpaper; }
  setWallpaper(w: string) { this._wallpaper = w; this.emit(); }

  get nodeAlias() { return this._nodeAlias; }
  setNodeAlias(a: string) { this._nodeAlias = a; this.emit(); }

  get torEnabled() { return this._torEnabled; }
  setTorEnabled(e: boolean) { this._torEnabled = e; this.emit(); }
}

export const settingsService = new SettingsServiceImpl();
