/**
 * Pure Web Audio API Sound Synthesizer for Abu Dhabi City Simulator.
 * Provides authentic, lightweight sound effects without external audio files.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Placed building chime (warm musical triad)
  public playBuild() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [329.63, 440.0, 554.37]; // E4, A4, C#5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx!.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.4);
    });
  }

  // Coins / Tax collection chime
  public playCoins() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Demolish / bulldozer thud
  public playDemolish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  // Web3 On-Chain Confirmation Fanfare
  public playWeb3Success() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const arpeggio = [440, 554.37, 659.25, 880]; // A major arpeggio
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.09 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.09);
      osc.stop(this.ctx!.currentTime + idx * 0.09 + 0.45);
    });
  }

  // Achievement unlock harp
  public playAchievement() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C major
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.06);
      osc.stop(this.ctx!.currentTime + i * 0.06 + 0.65);
    });
  }
}

export const soundSynth = new SoundSynthesizer();
