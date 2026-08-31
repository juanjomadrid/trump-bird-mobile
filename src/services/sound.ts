import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { StorageService } from './storage';

class SoundEffectsManager {
  private soundEnabled: boolean = true;
  private isSpeaking: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    this.soundEnabled = await StorageService.getSoundEnabled();
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    StorageService.setSoundEnabled(enabled);
    if (!enabled) {
      Speech.stop();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Plays a satirical spoken voice line using Speech synthesis.
   */
  public speakSatiricalLine(text: string, force: boolean = false) {
    if (!this.soundEnabled) return;
    if (this.isSpeaking && !force) return;

    try {
      Speech.stop();
      this.isSpeaking = true;
      Speech.speak(text, {
        language: 'en-US',
        pitch: 0.92, // slightly deeper resonant satirical timbre
        rate: 1.12,  // punchy energetic cadence
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch {
      this.isSpeaking = false;
    }
  }

  public playFlap() {
    if (!this.soundEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  public playScore(currentScore: number) {
    if (!this.soundEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Voice milestones at 10, 25, 50, 100
      if (currentScore === 10) {
        this.speakSatiricalLine("Fake news defeated! Tremendous!");
      } else if (currentScore === 25) {
        this.speakSatiricalLine("Stop the count! Yuge ratings!");
      } else if (currentScore === 50) {
        this.speakSatiricalLine("Total landslide victory! Unbelievable!");
      } else if (currentScore === 100) {
        this.speakSatiricalLine("Greatest candidate in history!");
      }
    } catch {}
  }

  public playPowerUp(type: 'IRON_DOME' | 'EXECUTIVE_ORDER' | 'GOLDEN_MAGNET') {
    if (!this.soundEnabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (type === 'IRON_DOME') {
        const phrases = ["Iron Dome active!", "Tremendous defense!", "Nobody breaks the dome!"];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speakSatiricalLine(phrase, true);
      } else if (type === 'EXECUTIVE_ORDER') {
        const phrases = ["Executive Order signed! You're fired!", "Total clearance! Cleared!"];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speakSatiricalLine(phrase, true);
      } else if (type === 'GOLDEN_MAGNET') {
        const phrases = ["Winning bigly!", "Attracting all the votes!"];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speakSatiricalLine(phrase, true);
      }
    } catch {}
  }

  public playCrash() {
    if (!this.soundEnabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const crashPhrases = [
        "Election rigged!",
        "Recount required!",
        "Fake news sabotage!",
        "Total witch hunt!",
        "Unconstitutional collision!",
      ];
      const phrase = crashPhrases[Math.floor(Math.random() * crashPhrases.length)];
      this.speakSatiricalLine(phrase, true);
    } catch {}
  }

  public playShieldBreak() {
    if (!this.soundEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  }
}

export const SoundManager = new SoundEffectsManager();
