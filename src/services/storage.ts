import AsyncStorage from '@react-native-async-storage/async-storage';
import { BirdSkinId, AudioSettings, PresidentialQuest } from '../types/game';

const KEYS = {
  PLAYER_NAME: '@trump_bird_player_name',
  HIGH_SCORE: '@trump_bird_high_score',
  DAILY_HIGH_SCORE: '@trump_bird_daily_high_score',
  DAILY_DATE_KEY: '@trump_bird_daily_date_key',
  SELECTED_SKIN: '@trump_bird_selected_skin',
  SOUND_ENABLED: '@trump_bird_sound_enabled',
  AUDIO_SETTINGS: '@trump_bird_audio_settings',
  PRESIDENTIAL_QUESTS: '@trump_bird_presidential_quests',
  RALLY_STARS: '@trump_bird_rally_stars',
};

const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  voiceVolume: 1.0,
  sfxVolume: 1.0,
  hapticsEnabled: true,
  highContrastEnabled: false,
};

const DEFAULT_QUESTS: PresidentialQuest[] = [
  {
    id: 'q_walls',
    title: 'Media Wall Breaker',
    description: 'Pass 15 Media Wall obstacles in any mode',
    target: 15,
    progress: 0,
    completed: false,
    claimed: false,
    rewardStars: 50,
    icon: '🧱',
  },
  {
    id: 'q_enemies',
    title: 'Fake News Obliterator',
    description: 'Destroy 5 Fake News Drones or Podiums',
    target: 5,
    progress: 0,
    completed: false,
    claimed: false,
    rewardStars: 75,
    icon: '💥',
  },
  {
    id: 'q_powerups',
    title: 'Executive Supremacy',
    description: 'Collect 4 Executive Orders or Iron Domes',
    target: 4,
    progress: 0,
    completed: false,
    claimed: false,
    rewardStars: 100,
    icon: '📜',
  },
];

export const StorageService = {
  getPlayerName: async (): Promise<string> => {
    try {
      const name = await AsyncStorage.getItem(KEYS.PLAYER_NAME);
      return name || 'Don The Great';
    } catch {
      return 'Don The Great';
    }
  },

  setPlayerName: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.PLAYER_NAME, name);
    } catch (e) {
      console.warn('Failed to save player name', e);
    }
  },

  getHighScore: async (): Promise<number> => {
    try {
      const scoreStr = await AsyncStorage.getItem(KEYS.HIGH_SCORE);
      return scoreStr ? parseInt(scoreStr, 10) : 0;
    } catch {
      return 0;
    }
  },

  setHighScore: async (score: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.HIGH_SCORE, score.toString());
    } catch (e) {
      console.warn('Failed to save high score', e);
    }
  },

  getDailyHighScore: async (todayKey: string): Promise<number> => {
    try {
      const savedDate = await AsyncStorage.getItem(KEYS.DAILY_DATE_KEY);
      if (savedDate !== todayKey) {
        return 0;
      }
      const scoreStr = await AsyncStorage.getItem(KEYS.DAILY_HIGH_SCORE);
      return scoreStr ? parseInt(scoreStr, 10) : 0;
    } catch {
      return 0;
    }
  },

  setDailyHighScore: async (score: number, todayKey: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.DAILY_DATE_KEY, todayKey);
      await AsyncStorage.setItem(KEYS.DAILY_HIGH_SCORE, score.toString());
    } catch (e) {
      console.warn('Failed to save daily high score', e);
    }
  },

  getSelectedSkin: async (): Promise<BirdSkinId> => {
    try {
      const skin = await AsyncStorage.getItem(KEYS.SELECTED_SKIN);
      return (skin as BirdSkinId) || 'classic';
    } catch {
      return 'classic';
    }
  },

  setSelectedSkin: async (skin: BirdSkinId): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.SELECTED_SKIN, skin);
    } catch (e) {
      console.warn('Failed to save selected skin', e);
    }
  },

  getSoundEnabled: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.SOUND_ENABLED);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  },

  setSoundEnabled: async (enabled: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.SOUND_ENABLED, enabled.toString());
    } catch (e) {
      console.warn('Failed to save sound preference', e);
    }
  },

  getAudioSettings: async (): Promise<AudioSettings> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.AUDIO_SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  setAudioSettings: async (settings: AudioSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
  },

  getQuests: async (): Promise<PresidentialQuest[]> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PRESIDENTIAL_QUESTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_QUESTS;
    } catch {
      return DEFAULT_QUESTS;
    }
  },

  setQuests: async (quests: PresidentialQuest[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.PRESIDENTIAL_QUESTS, JSON.stringify(quests));
    } catch (e) {
      console.warn('Failed to save quests', e);
    }
  },

  getRallyStars: async (): Promise<number> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.RALLY_STARS);
      return raw ? parseInt(raw, 10) : 100;
    } catch {
      return 100;
    }
  },

  setRallyStars: async (stars: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.RALLY_STARS, stars.toString());
    } catch (e) {
      console.warn('Failed to save rally stars', e);
    }
  },
};
