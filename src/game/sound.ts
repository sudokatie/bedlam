// Web Audio API synthesized sound effects for Bedlam

type SoundName = 
  | 'patientCured'
  | 'patientDeath'
  | 'roomBuilt'
  | 'staffHired'
  | 'cashReceived'
  | 'patientArriving'
  | 'lowCash'
  | 'gameWon'
  | 'gameLost';

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private config: SoundConfig = { enabled: true, volume: 0.3 };

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || 
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getVolume(): number {
    return this.config.volume;
  }

  play(sound: SoundName): void {
    if (!this.config.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (sound) {
      case 'patientCured':
        this.playPatientCured(ctx);
        break;
      case 'patientDeath':
        this.playPatientDeath(ctx);
        break;
      case 'roomBuilt':
        this.playRoomBuilt(ctx);
        break;
      case 'staffHired':
        this.playStaffHired(ctx);
        break;
      case 'cashReceived':
        this.playCashReceived(ctx);
        break;
      case 'patientArriving':
        this.playPatientArriving(ctx);
        break;
      case 'lowCash':
        this.playLowCash(ctx);
        break;
      case 'gameWon':
        this.playGameWon(ctx);
        break;
      case 'gameLost':
        this.playGameLost(ctx);
        break;
    }
  }

  // Happy ascending arpeggio for cure
  private playPatientCured(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [523, 659, 784]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.config.volume * 0.4, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }

  // Sad descending tone for death
  private playPatientDeath(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
    gain.gain.setValueAtTime(this.config.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Construction thud for room built
  private playRoomBuilt(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(this.config.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Pleasant chime for staff hired
  private playStaffHired(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(this.config.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Coin sound for cash received
  private playCashReceived(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [1200, 1600];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.config.volume * 0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.1);
    });
  }

  // Door bell for patient arriving
  private playPatientArriving(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(this.config.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Warning beep for low cash
  private playLowCash(ctx: AudioContext): void {
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(this.config.volume * 0.25, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.1);

      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.1);
    }
  }

  // Victory fanfare
  private playGameWon(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.config.volume * 0.4, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }

  // Game over sound
  private playGameLost(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [392, 349, 330, 262]; // G4, F4, E4, C4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.config.volume * 0.35, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);

      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.3);
    });
  }
}

// Singleton instance
export const soundSystem = new SoundSystem();
