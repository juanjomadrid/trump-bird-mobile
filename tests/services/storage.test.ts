import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../src/services/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlayerName', () => {
    it('should return the saved player name if it exists', async () => {
      const mockName = 'Test Player';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockName);

      const result = await StorageService.getPlayerName();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@trump_bird_player_name');
      expect(result).toBe(mockName);
    });

    it('should return "Don The Great" if no name is saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.getPlayerName();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@trump_bird_player_name');
      expect(result).toBe('Don The Great');
    });

    it('should return "Don The Great" if AsyncStorage throws an error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));

      const result = await StorageService.getPlayerName();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@trump_bird_player_name');
      expect(result).toBe('Don The Great');
    });
  });
});
