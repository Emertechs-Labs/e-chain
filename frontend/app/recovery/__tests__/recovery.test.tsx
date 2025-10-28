import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecoveryPage from '../page';
import { AuthKitProvider } from '@farcaster/auth-kit';

// Mock the hooks
const mockSignInButton = jest.fn();
jest.mock('@farcaster/auth-kit', () => ({
  AuthKitProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignInButton: (props: any) => (
    <button onClick={() => props.onSuccess?.({ username: 'testuser', fid: 123, addresses: ['0x123'] })}>
      Sign in with Farcaster
    </button>
  ),
}));

jest.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123', isConnected: true }),
}));

describe('RecoveryPage', () => {
  it('renders the recovery page', () => {
    render(
      <AuthKitProvider config={{ relay: '', rpcUrl: '', domain: '', siweUri: '' }}>
        <RecoveryPage />
      </AuthKitProvider>
    );

    expect(screen.getByText('Account Recovery')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Farcaster')).toBeInTheDocument();
  });

  it('shows verification step after sign in', async () => {
    render(
      <AuthKitProvider config={{ relay: '', rpcUrl: '', domain: '', siweUri: '' }}>
        <RecoveryPage />
      </AuthKitProvider>
    );

    fireEvent.click(screen.getByText('Sign in with Farcaster'));

    await waitFor(() => {
      expect(screen.getByText('Verify Recovery')).toBeInTheDocument();
    });
  });
});