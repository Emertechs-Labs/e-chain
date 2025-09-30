import { get, getAll } from '@vercel/edge-config';

export { get, getAll };

// Helper functions for edge config operations
export const edgeConfigHelpers = {
  // Get app configuration
  async getAppConfig() {
    return await get('app-config') || {};
  },

  // Get feature flags
  async getFeatureFlags() {
    return await get('feature-flags') || {};
  },

  // Get supported networks/chains
  async getSupportedChains() {
    return await get('supported-chains') || [];
  },

  // Get contract addresses by network
  async getContractAddresses(network: string) {
    const addresses = await get('contract-addresses') || {};
    if (typeof addresses === 'object' && addresses !== null && !Array.isArray(addresses)) {
      return (addresses as Record<string, any>)[network] || {};
    }
    return {};
  },

  // Get API rate limits
  async getRateLimits() {
    return await get('rate-limits') || {
      events: { limit: 100, window: 60 },
      users: { limit: 50, window: 60 }
    };
  },

  // Get maintenance mode status
  async isMaintenanceMode() {
    return await get('maintenance-mode') || false;
  },

  // Get all configuration
  async getAllConfig() {
    return await getAll();
  }
};