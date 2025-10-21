import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
  useBalance: jest.fn(),
  useNetwork: jest.fn(),
  useSwitchNetwork: jest.fn(),
}));

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns disconnected state when no wallet is connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
    });
    (useBalance as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeUndefined();
  });

  it('returns connected state when wallet is connected', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    
    (useAccount as jest.Mock).mockReturnValue({
      address: mockAddress,
      isConnected: true,
    });
    (useBalance as jest.Mock).mockReturnValue({
      data: { formatted: '1.5', symbol: 'ETH' },
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe(mockAddress);
    expect(result.current.balance).toBe('1.5');
  });

  it('handles wallet connection', async () => {
    const mockConnect = jest.fn();
    
    (useConnect as jest.Mock).mockReturnValue({
      connect: mockConnect,
      connectors: [{ id: 'metamask', name: 'MetaMask' }],
    });

    const { result } = renderHook(() => useWallet());

    act(() => {
      result.current.connect('metamask');
    });

    expect(mockConnect).toHaveBeenCalled();
  });

  it('handles wallet disconnection', async () => {
    const mockDisconnect = jest.fn();
    
    (useDisconnect as jest.Mock).mockReturnValue({
      disconnect: mockDisconnect,
    });

    const { result } = renderHook(() => useWallet());

    act(() => {
      result.current.disconnect();
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('formats balance correctly', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });
    (useBalance as jest.Mock).mockReturnValue({
      data: { formatted: '1234.56789', symbol: 'ETH' },
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.balance).toBe('1234.56789');
    expect(result.current.balanceSymbol).toBe('ETH');
  });

  it('handles missing balance data', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });
    (useBalance as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.balance).toBeUndefined();
  });

  it('provides shortened address format', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    
    (useAccount as jest.Mock).mockReturnValue({
      address: mockAddress,
      isConnected: true,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.shortAddress).toBe('0x1234...7890');
  });
});
