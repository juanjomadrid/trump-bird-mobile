import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { StorageService } from './storage';
import { AudioSettings } from '../types/game';

type SpeechListener = (text: string, durationMs?: number) => void;

export class SoundManager {
  private static settings: AudioSettings = {
    soundEnabled: true,
    voiceVolume: 1.0,
    sfxVolume: 1.0,
    hapticsEnabled: true,
    highContrastEnabled: false,
  };
  private static isSpeaking: boolean = false;
  private static speechListeners: SpeechListener[] = [];

  public static async init() {
    const loaded = await StorageService.getAudioSettings();
    this.settings = loaded;
  }

  public static registerSpeechListener(listener: SpeechListener) {
    this.speechListeners.push(listener);
    return () => {
      this.speechListeners = this.speechListeners.filter((l) => l !== listener);
    };
  }

  private static notifySpeechListeners(text: string, durationMs: number = 2600) {
    this.speechListeners.forEach((l) => l(text, durationMs));
  }

  public static updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    StorageService.setAudioSettings(this.settings);
    if (!this.settings.soundEnabled || this.settings.voiceVolume === 0) {
      Speech.stop();
    }
  }

  public static getSettings(): AudioSettings {
    return this.settings;
  }

  public static setSoundEnabled(enabled: boolean) {
    this.updateSettings({ soundEnabled: enabled });
  }

  public static isSoundEnabled(): boolean {
    return this.settings.soundEnabled;
  }

  /**
   * Spoken voice line with Donald Trump signature cadence & pitch.
   * Pitch: 0.88 (resonant, nasal baritone)
   * Rate: 0.94 (deliberate, punchy pacing with natural emphasis)
   */
  public static speakSatiricalLine(text: string, force: boolean = false, displayDurationMs?: number) {
    // Notify visual comic balloon regardless of audio mute so subtitles appear
    this.notifySpeechListeners(text, displayDurationMs || 2800);

    if (!this.settings.soundEnabled || this.settings.voiceVolume <= 0) return;
    if (this.isSpeaking && !force) return;

    try {
      Speech.stop();
      this.isSpeaking = true;
      Speech.speak(text, {
        language: 'en-US',
        pitch: 0.88, // Signature Trumpian baritone resonance
        rate: 0.94,  // Deliberate, impactful cadence
        volume: this.settings.voiceVolume,
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

  public static playWhoosh() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  }

  public static play(soundName: string) {
    if (!this.settings.soundEnabled) return;

    if (soundName === 'WHOOSH') {
      this.playWhoosh();
    } else if (soundName === 'FLAP') {
      this.playFlap();
    } else if (soundName === 'COIN') {
      this.playCoin();
    } else if (soundName === 'CRASH') {
      this.playCrash();
    } else if (soundName === 'SHIELD_BREAK') {
      this.playShieldBreak();
    }
  }

  public static playFlap() {
    if (!this.settings.hapticsEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  public static playCoin() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  }

  public static playScore(currentScore: number) {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    // Iconic Trumpian milestone dialogue
    if (currentScore === 10) {
      this.speakSatiricalLine("Fake news media! Total disaster! We're winning!", true);
    } else if (currentScore === 25) {
      this.speakSatiricalLine("Stop the count! Yuge ratings! The biggest in history!", true);
    } else if (currentScore === 50) {
      this.speakSatiricalLine("Total landslide victory! Nobody does it better!", true);
    } else if (currentScore === 100) {
      this.speakSatiricalLine("We are winning so much, you will get tired of winning!", true);
    }
  }

  public static playComboMax() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    this.speakSatiricalLine("Super popular! Maximum ratings! Tremendous!", true, 2200);
  }

  public static playPowerUp(type: 'IRON_DOME' | 'EXECUTIVE_ORDER' | 'GOLDEN_MAGNET') {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }

    if (type === 'IRON_DOME') {
      const phrases = [
        "Iron Dome active! Nobody breaks this wall!",
        "Tremendous defense! Impenetrable, believe me!",
        "Strongest border in American history!",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.speakSatiricalLine(phrase, true);
    } else if (type === 'EXECUTIVE_ORDER') {
      const phrases = [
        "Executive Order signed! You're fired! Out!",
        "Total clearance! Fake news obliterated!",
        "Done by executive decree! Beautiful!",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.speakSatiricalLine(phrase, true);
    } else if (type === 'GOLDEN_MAGNET') {
      const phrases = [
        "Winning bigly! Attracting all the votes!",
        "The greatest magnet! Millions and millions of votes!",
        "Look at all these votes coming in!",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.speakSatiricalLine(phrase, true);
    }
  }

  public static playCrash() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
    const crashPhrases = [
      "Total witch hunt! Election rigged!",
      "Recount immediately! Recount the votes!",
      "Fake news sabotage! Total disaster!",
      "Unconstitutional collision! Disgraceful!",
      "We won this race by a lot!",
    ];
    const phrase = crashPhrases[Math.floor(Math.random() * crashPhrases.length)];
    this.speakSatiricalLine(phrase, true);
  }

  public static playShatter() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  }

  public static playPowerup() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  }

  public static playShieldBreak() {
    if (this.settings.hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  }
}
