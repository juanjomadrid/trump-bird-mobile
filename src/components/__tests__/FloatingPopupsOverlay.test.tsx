import React from 'react';
import { render } from '@testing-library/react-native';
import { FloatingPopupsOverlay } from '../FloatingPopupsOverlay';

describe('FloatingPopupsOverlay', () => {
  it('returns null when popups array is empty', () => {
    const { toJSON } = render(<FloatingPopupsOverlay popups={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when popups is null', () => {
    // @ts-ignore
    const { toJSON } = render(<FloatingPopupsOverlay popups={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders popups when popups array is not empty', () => {
    const popups = [
      { id: '1', x: 100, y: 100, text: 'Test Popup 1', alpha: 1, scale: 1, color: 'red' },
      { id: '2', x: 200, y: 200, text: 'Test Popup 2', alpha: 0.5, scale: 1.5, color: 'blue' },
    ];
    const { getByText } = render(<FloatingPopupsOverlay popups={popups} />);

    expect(getByText('Test Popup 1')).toBeTruthy();
    expect(getByText('Test Popup 2')).toBeTruthy();
  });
});
