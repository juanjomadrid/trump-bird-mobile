import { StorageService } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(),
      getItem: jest.fn(),
    },
    setItem: jest.fn(),
    getItem: jest.fn()
  };
});

const KEYS = {
  PLAYER_NAME: '@trump_bird_player_name',
  HIGH_SCORE: '@trump_bird_high_score',
  DAILY_HIGH_SCORE: '@trump_bird_daily_high_score',
  DAILY_DATE_KEY: '@trump_bird_daily_date_key',
  SELECTED_SKIN: '@trump_bird_selected_skin',
  UNLOCKED_SKINS: '@trump_bird_unlocked_skins',
  COINS: '@trump_bird_coins',
  SOUND_ENABLED: '@trump_bird_sound_enabled',
  AUDIO_SETTINGS: '@trump_bird_audio_settings',
  PRESIDENTIAL_QUESTS: '@trump_bird_presidential_quests',
  RALLY_STARS: '@trump_bird_rally_stars',
};

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getPlayerName / setPlayerName ---
  describe('getPlayerName', () => {
    it('returns the player name if it exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('Test Player');
      const name = await StorageService.getPlayerName();
      expect(name).toBe('Test Player');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEYS.PLAYER_NAME);
    });

    it('returns default name if player name does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const name = await StorageService.getPlayerName();
      expect(name).toBe('Don The Great');
    });

    it('returns default name if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const name = await StorageService.getPlayerName();
      expect(name).toBe('Don The Great');
    });
  });

  describe('setPlayerName', () => {
    it('saves the player name', async () => {
      await StorageService.setPlayerName('New Player');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.PLAYER_NAME, 'New Player');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setPlayerName('New Player')).resolves.not.toThrow();
    });
  });

  // --- getHighScore / setHighScore ---
  describe('getHighScore', () => {
    it('returns high score if it exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('42');
      const score = await StorageService.getHighScore();
      expect(score).toBe(42);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEYS.HIGH_SCORE);
    });

    it('returns 0 if high score does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const score = await StorageService.getHighScore();
      expect(score).toBe(0);
    });

    it('returns 0 if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const score = await StorageService.getHighScore();
      expect(score).toBe(0);
    });
  });

  describe('setHighScore', () => {
    it('saves the high score', async () => {
      await StorageService.setHighScore(100);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.HIGH_SCORE, '100');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setHighScore(100)).resolves.not.toThrow();
    });
  });

  // --- getDailyHighScore / setDailyHighScore ---
  describe('getDailyHighScore', () => {
    it('returns daily high score if date matches', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === KEYS.DAILY_DATE_KEY) return Promise.resolve('2023-10-25');
        if (key === KEYS.DAILY_HIGH_SCORE) return Promise.resolve('15');
        return Promise.resolve(null);
      });
      const score = await StorageService.getDailyHighScore('2023-10-25');
      expect(score).toBe(15);
    });

    it('returns 0 if date does not match', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === KEYS.DAILY_DATE_KEY) return Promise.resolve('2023-10-24'); // yesterday
        if (key === KEYS.DAILY_HIGH_SCORE) return Promise.resolve('15');
        return Promise.resolve(null);
      });
      const score = await StorageService.getDailyHighScore('2023-10-25');
      expect(score).toBe(0);
    });

    it('returns 0 if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const score = await StorageService.getDailyHighScore('2023-10-25');
      expect(score).toBe(0);
    });
  });

  describe('setDailyHighScore', () => {
    it('saves the daily high score and date', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      await StorageService.setDailyHighScore(20, '2023-10-25');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.DAILY_DATE_KEY, '2023-10-25');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.DAILY_HIGH_SCORE, '20');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setDailyHighScore(20, '2023-10-25')).resolves.not.toThrow();
    });
  });

  // --- getSelectedSkin / setSelectedSkin ---
  describe('getSelectedSkin', () => {
    it('returns selected skin if exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('gold');
      const skin = await StorageService.getSelectedSkin();
      expect(skin).toBe('gold');
    });

    it('returns classic if not exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const skin = await StorageService.getSelectedSkin();
      expect(skin).toBe('classic');
    });

    it('returns classic if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const skin = await StorageService.getSelectedSkin();
      expect(skin).toBe('classic');
    });
  });

  describe('setSelectedSkin', () => {
    it('saves the selected skin', async () => {
      await StorageService.setSelectedSkin('robot');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.SELECTED_SKIN, 'robot');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setSelectedSkin('robot')).resolves.not.toThrow();
    });
  });

  // --- getUnlockedSkins / unlockSkin ---
  describe('getUnlockedSkins', () => {
    it('returns unlocked skins if they exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['classic', 'gold']));
      const skins = await StorageService.getUnlockedSkins();
      expect(skins).toEqual(['classic', 'gold']);
    });

    it('returns default classic if parse fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      const skins = await StorageService.getUnlockedSkins();
      expect(skins).toEqual(['classic']);
    });

    it('returns default classic if empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const skins = await StorageService.getUnlockedSkins();
      expect(skins).toEqual(['classic']);
    });

    it('returns default classic if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const skins = await StorageService.getUnlockedSkins();
      expect(skins).toEqual(['classic']);
    });
  });

  describe('unlockSkin', () => {
    it('adds skin if not unlocked', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['classic']));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const skins = await StorageService.unlockSkin('gold');
      expect(skins).toEqual(['classic', 'gold']);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.UNLOCKED_SKINS, JSON.stringify(['classic', 'gold']));
    });

    it('does not add skin if already unlocked', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['classic', 'gold']));

      const skins = await StorageService.unlockSkin('gold');
      expect(skins).toEqual(['classic', 'gold']);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('returns default classic if throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));

      const skins = await StorageService.unlockSkin('gold');
      expect(skins).toEqual(['classic']);
    });
  });

  // --- getCoins / setCoins / addCoins ---
  describe('getCoins', () => {
    it('returns coins if they exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('100');
      const coins = await StorageService.getCoins();
      expect(coins).toBe(100);
    });

    it('returns 50 if they do not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const coins = await StorageService.getCoins();
      expect(coins).toBe(50);
    });

    it('returns 50 if getItem throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const coins = await StorageService.getCoins();
      expect(coins).toBe(50);
    });
  });

  describe('setCoins', () => {
    it('saves the coins', async () => {
      await StorageService.setCoins(200);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.COINS, '200');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setCoins(200)).resolves.not.toThrow();
    });
  });

  describe('addCoins', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('adds positive coins and updates storage', async () => {
      jest.spyOn(StorageService, 'getCoins').mockResolvedValue(100);

      const newCoins = await StorageService.addCoins(50);
      expect(newCoins).toBe(150);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.COINS, '150');
    });

    it('adds negative coins and clamps to 0', async () => {
      jest.spyOn(StorageService, 'getCoins').mockResolvedValue(10);

      const newCoins = await StorageService.addCoins(-50);
      expect(newCoins).toBe(0);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.COINS, '0');
    });

    it('returns 0 if error occurs', async () => {
      jest.spyOn(StorageService, 'getCoins').mockRejectedValue(new Error('error'));

      const newCoins = await StorageService.addCoins(50);
      expect(newCoins).toBe(0);
    });
  });

  // --- getSoundEnabled / setSoundEnabled ---
  describe('getSoundEnabled', () => {
    it('returns true if true string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const sound = await StorageService.getSoundEnabled();
      expect(sound).toBe(true);
    });

    it('returns false if false string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
      const sound = await StorageService.getSoundEnabled();
      expect(sound).toBe(false);
    });

    it('returns true if null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const sound = await StorageService.getSoundEnabled();
      expect(sound).toBe(true);
    });

    it('returns true if throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const sound = await StorageService.getSoundEnabled();
      expect(sound).toBe(true);
    });
  });

  describe('setSoundEnabled', () => {
    it('saves sound setting', async () => {
      await StorageService.setSoundEnabled(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.SOUND_ENABLED, 'false');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setSoundEnabled(true)).resolves.not.toThrow();
    });
  });

  // --- getAudioSettings / setAudioSettings ---
  describe('getAudioSettings', () => {
    it('returns merged audio settings if they exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ voiceVolume: 0.5, soundEnabled: false }));
      const settings = await StorageService.getAudioSettings();
      expect(settings.voiceVolume).toBe(0.5);
      expect(settings.soundEnabled).toBe(false);
      expect(settings.hapticsEnabled).toBe(true); // default merged
    });

    it('returns default audio settings if null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const settings = await StorageService.getAudioSettings();
      expect(settings.voiceVolume).toBe(1.0);
    });

    it('returns default audio settings if throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const settings = await StorageService.getAudioSettings();
      expect(settings.voiceVolume).toBe(1.0);
    });
  });

  describe('setAudioSettings', () => {
    it('saves audio settings', async () => {
      const settings = {
        soundEnabled: false,
        voiceVolume: 0.5,
        sfxVolume: 0.8,
        hapticsEnabled: false,
        highContrastEnabled: true,
      };
      await StorageService.setAudioSettings(settings);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      const settings = {
        soundEnabled: false,
        voiceVolume: 0.5,
        sfxVolume: 0.8,
        hapticsEnabled: false,
        highContrastEnabled: true,
      };
      await expect(StorageService.setAudioSettings(settings)).resolves.not.toThrow();
    });
  });

  // --- getQuests / setQuests ---
  describe('getQuests', () => {
    it('returns quests if they exist', async () => {
      const dummyQuests = [{ id: 'q1' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(dummyQuests));
      const quests = await StorageService.getQuests();
      expect(quests).toEqual(dummyQuests);
    });

    it('returns defaults if quests are empty array', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      const quests = await StorageService.getQuests();
      expect(quests.length).toBeGreaterThan(0); // Should be the DEFAULT_QUESTS
    });

    it('returns defaults if null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const quests = await StorageService.getQuests();
      expect(quests.length).toBeGreaterThan(0);
    });

    it('returns defaults if throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const quests = await StorageService.getQuests();
      expect(quests.length).toBeGreaterThan(0);
    });
  });

  describe('setQuests', () => {
    it('saves quests', async () => {
      // Need to cast to any since we are passing mock data
      await StorageService.setQuests([{ id: 'q1' }] as any);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.PRESIDENTIAL_QUESTS, JSON.stringify([{ id: 'q1' }]));
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setQuests([{ id: 'q1' }] as any)).resolves.not.toThrow();
    });
  });

  // --- getRallyStars / setRallyStars ---
  describe('getRallyStars', () => {
    it('returns rally stars if exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('150');
      const stars = await StorageService.getRallyStars();
      expect(stars).toBe(150);
    });

    it('returns 100 if null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const stars = await StorageService.getRallyStars();
      expect(stars).toBe(100);
    });

    it('returns 100 if throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('error'));
      const stars = await StorageService.getRallyStars();
      expect(stars).toBe(100);
    });
  });

  describe('setRallyStars', () => {
    it('saves rally stars', async () => {
      await StorageService.setRallyStars(200);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.RALLY_STARS, '200');
    });

    it('handles setItem throwing', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('error'));
      await expect(StorageService.setRallyStars(200)).resolves.not.toThrow();
    });
  });
});
