// Error Tracking Rules and Alert Configuration
// =============================================
// Define error severity, grouping, and alerting rules

export interface ErrorRule {
  name: string;
  pattern: RegExp | string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alertChannels: ('slack' | 'email' | 'pagerduty')[];
  autoAssign?: string; // Team member email
  fingerprint?: string[]; // Custom grouping
}

// Critical Errors - Immediate Alert
export const CRITICAL_ERROR_RULES: ErrorRule[] = [
  {
    name: 'Smart Contract Deployment Failed',
    pattern: /contract deployment failed|deployment error/i,
    severity: 'critical',
    alertChannels: ['slack', 'email', 'pagerduty'],
    autoAssign: 'blockchain-team@echain.xyz',
    fingerprint: ['{{ default }}', 'contract-deployment'],
  },
  {
    name: 'Payment Processing Failed',
    pattern: /payment.*failed|transaction.*reverted/i,
    severity: 'critical',
    alertChannels: ['slack', 'email'],
    autoAssign: 'payments-team@echain.xyz',
    fingerprint: ['{{ default }}', 'payment-failure'],
  },
  {
    name: 'Database Connection Lost',
    pattern: /database.*connection.*lost|ECONNREFUSED.*postgresql/i,
    severity: 'critical',
    alertChannels: ['slack', 'pagerduty'],
    autoAssign: 'devops@echain.xyz',
  },
  {
    name: 'Authentication System Down',
    pattern: /auth.*failed|authentication.*error/i,
    severity: 'critical',
    alertChannels: ['slack', 'email'],
    autoAssign: 'security@echain.xyz',
  },
  {
    name: 'RPC Provider Failure',
    pattern: /all rpc providers failed|no healthy providers/i,
    severity: 'critical',
    alertChannels: ['slack', 'pagerduty'],
    autoAssign: 'infrastructure@echain.xyz',
    fingerprint: ['rpc-failure'],
  },
];

// High Priority Errors - Alert within 15 minutes
export const HIGH_PRIORITY_ERROR_RULES: ErrorRule[] = [
  {
    name: 'Contract Interaction Failed',
    pattern: /contract.*call.*failed|execution reverted/i,
    severity: 'high',
    alertChannels: ['slack'],
    fingerprint: ['{{ default }}', 'contract-interaction'],
  },
  {
    name: 'IPFS Upload Failed',
    pattern: /ipfs.*upload.*failed|pinata.*error/i,
    severity: 'high',
    alertChannels: ['slack'],
    autoAssign: 'backend-team@echain.xyz',
  },
  {
    name: 'NFT Minting Failed',
    pattern: /nft.*mint.*failed|token.*creation.*error/i,
    severity: 'high',
    alertChannels: ['slack', 'email'],
    autoAssign: 'blockchain-team@echain.xyz',
  },
  {
    name: 'Vercel Blob Upload Error',
    pattern: /blob.*upload.*failed|vercel.*storage.*error/i,
    severity: 'high',
    alertChannels: ['slack'],
  },
  {
    name: 'Wallet Connection Timeout',
    pattern: /wallet.*connection.*timeout|rainbowkit.*timeout/i,
    severity: 'high',
    alertChannels: ['slack'],
    fingerprint: ['wallet-timeout'],
  },
];

// Medium Priority - Monitor and Review Daily
export const MEDIUM_PRIORITY_ERROR_RULES: ErrorRule[] = [
  {
    name: 'Network Request Failed',
    pattern: /fetch.*failed|network.*error/i,
    severity: 'medium',
    alertChannels: [],
    fingerprint: ['network-error'],
  },
  {
    name: 'Image Load Failed',
    pattern: /image.*load.*failed|img.*error/i,
    severity: 'medium',
    alertChannels: [],
  },
  {
    name: 'Cache Miss Rate High',
    pattern: /cache.*miss/i,
    severity: 'medium',
    alertChannels: [],
  },
  {
    name: 'Slow Query Performance',
    pattern: /query.*slow|timeout.*exceeded/i,
    severity: 'medium',
    alertChannels: [],
  },
];

// Low Priority - Review Weekly
export const LOW_PRIORITY_ERROR_RULES: ErrorRule[] = [
  {
    name: 'Analytics Tracking Failed',
    pattern: /analytics.*failed|tracking.*error/i,
    severity: 'low',
    alertChannels: [],
  },
  {
    name: 'Non-Critical UI Error',
    pattern: /ui.*warning|display.*error/i,
    severity: 'low',
    alertChannels: [],
  },
];

// Alert Thresholds
export const ALERT_THRESHOLDS = {
  critical: {
    errorCount: 1, // Alert immediately
    timeWindow: '1m',
    cooldown: '5m',
  },
  high: {
    errorCount: 5, // Alert after 5 occurrences
    timeWindow: '5m',
    cooldown: '15m',
  },
  medium: {
    errorCount: 20,
    timeWindow: '15m',
    cooldown: '1h',
  },
  low: {
    errorCount: 50,
    timeWindow: '1h',
    cooldown: '24h',
  },
};

// Error Grouping Fingerprints
export const ERROR_FINGERPRINTS = {
  contractError: ['{{ default }}', '{{ transaction.function }}'],
  networkError: ['{{ default }}', '{{ request.url }}'],
  walletError: ['{{ default }}', '{{ tags.wallet }}'],
  genericError: ['{{ default }}'],
};

// Custom Error Filtering
export const shouldIgnoreError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';

  // Ignore user-initiated cancellations
  if (message.includes('user rejected') || message.includes('user denied')) {
    return true;
  }

  // Ignore browser extension errors
  if (message.includes('chrome-extension') || message.includes('moz-extension')) {
    return true;
  }

  // Ignore ResizeObserver errors (common, harmless)
  if (message.includes('resizeobserver')) {
    return true;
  }

  // Ignore expected network timeouts (will retry)
  if (message.includes('timeout') && message.includes('retry')) {
    return true;
  }

  return false;
};

// Error Priority Calculator
export const calculateErrorPriority = (error: Error, context?: Record<string, any>): ErrorRule['severity'] => {
  const message = error.message?.toLowerCase() || '';

  // Check critical patterns first
  for (const rule of CRITICAL_ERROR_RULES) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
    if (pattern.test(message)) {
      return 'critical';
    }
  }

  // Check high priority
  for (const rule of HIGH_PRIORITY_ERROR_RULES) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
    if (pattern.test(message)) {
      return 'high';
    }
  }

  // Check medium priority
  for (const rule of MEDIUM_PRIORITY_ERROR_RULES) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
    if (pattern.test(message)) {
      return 'medium';
    }
  }

  // Default to low
  return 'low';
};
