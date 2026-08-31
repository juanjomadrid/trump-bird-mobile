import AsyncStorage from '@react-native-async-storage/async-storage';
import { BirdSkinId } from '../types/game';

const KEYS = {
  PLAYER_NAME: '@trump_bird_player_name',
  HIGH_SCORE: '@trump_bird_high_score',
  DAILY_HIGH_SCORE: '@trump_bird_daily_high_score',
  DAILY_DATE_KEY: '@trump_bird_daily_date_key',
  SELECTED_SKIN: '@trump_bird_selected_skin',
  SOUND_ENABLED: '@trump_bird_sound_enabled',
};

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
};
