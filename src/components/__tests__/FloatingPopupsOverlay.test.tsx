import React from 'react';
import { render } from '@testing-library/react-native';
import { FloatingPopupsOverlay } from '../FloatingPopupsOverlay';
import { FloatingPopup } from '../../types/game';

describe('FloatingPopupsOverlay', () => {
  it('renders correctly with an empty array', async () => {
    const component = await render(<FloatingPopupsOverlay popups={[]} />);
    expect(component.toJSON()).toBeNull();
  });

  it('renders correctly with null', async () => {
    const component = await render(<FloatingPopupsOverlay popups={null as any} />);
    expect(component.toJSON()).toBeNull();
  });

  it('renders popups correctly', async () => {
    const popups: FloatingPopup[] = [
      { id: '1', x: 100, y: 100, text: '+10', color: '#ff0000', scale: 1, alpha: 1, life: 1, maxLife: 1 },
      { id: '2', x: 200, y: 200, text: 'Combo!', color: '#00ff00', scale: 1.5, alpha: 0.5, life: 1, maxLife: 1 },
    ];
    const component = await render(<FloatingPopupsOverlay popups={popups} />);
    expect(component.getByText('+10')).toBeTruthy();
    expect(component.getByText('Combo!')).toBeTruthy();
  });
});
