import { StorageService } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('StorageService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setPlayerName', () => {
    it('handles setItem rejection and calls console.warn', async () => {
      const mockError = new Error('AsyncStorage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(mockError);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await expect(StorageService.setPlayerName('Test Name')).resolves.not.toThrow();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@trump_bird_player_name', 'Test Name');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save player name', mockError);

      consoleSpy.mockRestore();
    });
  });
});
