// Luxury Watch Audio System for Supreme Gauges
export class LuxuryWatchAudio {
  private static instance: LuxuryWatchAudio;
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.3; // Subtle luxury audio

  private constructor() {}

  static getInstance(): LuxuryWatchAudio {
    if (!LuxuryWatchAudio.instance) {
      LuxuryWatchAudio.instance = new LuxuryWatchAudio();
    }
    return LuxuryWatchAudio.instance;
  }

  async initializeAudio(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Preload luxury watch audio files
    const audioFiles = {
      tick: '/sounds/luxury-watch/rolex-tick.mp3',
      bezelClick: '/sounds/luxury-watch/rolex-bezel-click.mp3',
      crystalTing: '/sounds/luxury-watch/crystal-ting.mp3',
    };

    for (const [key, url] of Object.entries(audioFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load luxury watch audio: ${url}`, error);
      }
    }
  }

  playSound(soundName: string, volume: number = this.volume): void {
    if (!this.audioContext || !this.audioBuffers.has(soundName)) {
      return;
    }

    try {
      const audioBuffer = this.audioBuffers.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play luxury watch sound: ${soundName}`, error);
    }
  }

  // Luxury watch-specific audio methods
  playTick(): void {
    this.playSound('tick', 0.1); // Very subtle tick
  }

  playBezelClick(): void {
    this.playSound('bezelClick', 0.2); // Precision screw interaction
  }

  playCrystalTing(): void {
    this.playSound('crystalTing', 0.15); // Jewel cap settling
  }

  playKineticSequence(): void {
    // Sequence for kinetic needle animation
    setTimeout(() => this.playBezelClick(), 0);    // Start spin
    setTimeout(() => this.playTick(), 1500);       // Mid-spin
    setTimeout(() => this.playBezelClick(), 3000); // Settle start
    setTimeout(() => this.playCrystalTing(), 4000); // Final settle
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

// Initialize audio system
export const luxuryAudio = LuxuryWatchAudio.getInstance();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize on first user interaction to comply with browser policies
  const initializeOnInteraction = () => {
    luxuryAudio.initializeAudio();
    document.removeEventListener('click', initializeOnInteraction);
    document.removeEventListener('keydown', initializeOnInteraction);
  };

  document.addEventListener('click', initializeOnInteraction);
  document.addEventListener('keydown', initializeOnInteraction);
}