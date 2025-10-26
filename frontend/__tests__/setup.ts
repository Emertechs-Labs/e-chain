/**
 * Vitest Setup File
 * Global test configuration and mocks
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock environment variables
vi.mock('./lib/env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_FARCASTER_CLIENT_ID: 'test-client-id',
    NEXT_PUBLIC_BASE_RPC_URL: 'https://sepolia.base.org',
  },
}));

// Global test utilities
(global as any).testUtils = {
  createMockEvent: (overrides = {}) => ({
    id: 'test-event-id',
    name: 'Test Event',
    description: 'Test event description',
    startDate: new Date('2025-01-01T10:00:00Z'),
    endDate: new Date('2025-01-01T12:00:00Z'),
    location: 'Test Location',
    price: '0.1',
    maxCapacity: 100,
    ticketsSold: 0,
    status: 'PUBLISHED',
    organizerId: 'test-organizer-id',
    imageUrl: 'https://example.com/image.jpg',
    ...overrides,
  }),

  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    username: 'testuser',
    role: 'ATTENDEE',
    ...overrides,
  }),
};