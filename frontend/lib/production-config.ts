// Production environment configuration
// This file validates production setup and provides configuration helpers

export const PRODUCTION_CONFIG = {
  // Environment validation
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Required environment variables
  requiredEnvVars: [
    'DATABASE_URL',
    'NEXT_PUBLIC_BASE_RPC_URL',
    'NEXT_PUBLIC_ALCHEMY_API_KEY',
    'NEXT_PUBLIC_FARCASTER_RELAY',
    'FARCASTER_DOMAIN',
    'NEXT_PUBLIC_COINBASE_PROJECT_ID',
    'PINATA_API_KEY',
    'PINATA_SECRET_API_KEY',
  ],

  // Security settings
  security: {
    enableCSP: true,
    enableRateLimiting: true,
    enableLogging: true,
    maxRecoveryAttemptsPerHour: 5,
    nonceExpiryMinutes: 5,
    sessionTimeoutHours: 24,
  },

  // Feature flags
  features: {
    farcasterAuth: true,
    socialRecovery: true,
    frameIntegration: true,
    gaslessTransactions: true,
    pwaSupport: true,
  },

  // API rate limits
  rateLimits: {
    authAttempts: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 minutes
    recoveryAttempts: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
    frameInteractions: { windowMs: 60 * 1000, max: 30 }, // 30 per minute
  },

  // Monitoring
  monitoring: {
    enableSentry: true,
    enableCustomLogging: true,
    logLevel: process.env.LOG_LEVEL || 'info',
    alertThresholds: {
      errorRate: 0.05, // 5% error rate
      responseTime: 2000, // 2 second average response time
    },
  },
};

// Validation function for production readiness
export function validateProductionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required environment variables
  for (const envVar of PRODUCTION_CONFIG.requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Validate URLs
  const urlVars = ['NEXT_PUBLIC_BASE_RPC_URL', 'NEXT_PUBLIC_FARCASTER_RELAY'];
  for (const urlVar of urlVars) {
    const url = process.env[urlVar];
    if (url) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'https:') {
          errors.push(`${urlVar} must use HTTPS protocol`);
        }
      } catch {
        errors.push(`${urlVar} is not a valid URL`);
      }
    }
  }

  // Validate API keys format (basic checks)
  const apiKeyVars = ['NEXT_PUBLIC_ALCHEMY_API_KEY', 'PINATA_API_KEY'];
  for (const apiKeyVar of apiKeyVars) {
    const apiKey = process.env[apiKeyVar];
    if (apiKey && apiKey.length < 20) {
      errors.push(`${apiKeyVar} appears to be too short for a valid API key`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Production readiness check
export function checkProductionReadiness(): { ready: boolean; issues: string[] } {
  const issues: string[] = [];
  const configValidation = validateProductionConfig();

  if (!configValidation.isValid) {
    issues.push(...configValidation.errors);
  }

  // Additional checks
  if (!PRODUCTION_CONFIG.isProduction && !PRODUCTION_CONFIG.isStaging) {
    issues.push('Not running in production or staging environment');
  }

  // Check for debug features in production
  if (PRODUCTION_CONFIG.isProduction && process.env.DEBUG === 'true') {
    issues.push('Debug mode enabled in production');
  }

  return {
    ready: issues.length === 0,
    issues,
  };
}