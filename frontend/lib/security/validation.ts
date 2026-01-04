/**
 * Input Validation and Sanitization
 * Protects against XSS, SQL injection, and malformed data
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof DOMPurify.sanitize === 'function') {
    // First sanitize as HTML
    let sanitized = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });

    // Additionally sanitize dangerous protocols and function calls in plain text
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');

    // Remove common dangerous function calls that might appear in plain text
    sanitized = sanitized.replace(/\balert\s*\(/gi, '');
    sanitized = sanitized.replace(/\beval\s*\(/gi, '');
    sanitized = sanitized.replace(/\bconfirm\s*\(/gi, '');
    sanitized = sanitized.replace(/\bprompt\s*\(/gi, '');

    return sanitized;
  }
  // Fallback if sanitize is not available
  return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/data:/gi, '')
              .replace(/vbscript:/gi, '')
              .replace(/\balert\s*\(/gi, '')
              .replace(/\beval\s*\(/gi, '')
              .replace(/\bconfirm\s*\(/gi, '')
              .replace(/\bprompt\s*\(/gi, '');
}

/**
 * Validate and sanitize event ID
 */
export function validateEventId(eventId: unknown): string {
  if (typeof eventId !== 'string') {
    throw new ValidationError('Event ID must be a string');
  }

  // Event IDs should be alphanumeric with optional hyphens/underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
    throw new ValidationError('Invalid event ID format');
  }

  if (eventId.length > 50) {
    throw new ValidationError('Event ID too long');
  }

  return eventId;
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: unknown): string {
  if (typeof address !== 'string') {
    throw new ValidationError('Address must be a string');
  }

  // Ethereum address regex
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new ValidationError('Invalid Ethereum address format');
  }

  return address.toLowerCase();
}

/**
 * Validate and sanitize quantity
 */
export function validateQuantity(quantity: unknown): number {
  const num = Number(quantity);

  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError('Quantity must be a valid number');
  }

  if (num < 1 || num > 100) {
    throw new ValidationError('Quantity must be between 1 and 100');
  }

  if (!Number.isInteger(num)) {
    throw new ValidationError('Quantity must be an integer');
  }

  return num;
}

/**
 * Validate price (ETH amount)
 */
export function validatePrice(price: unknown): string {
  if (typeof price !== 'string') {
    throw new ValidationError('Price must be a string');
  }

  // Allow up to 18 decimal places for ETH
  if (!/^\d+(\.\d{1,18})?$/.test(price)) {
    throw new ValidationError('Invalid price format');
  }

  const num = parseFloat(price);
  if (num <= 0 || num > 1000000) {
    throw new ValidationError('Price must be between 0 and 1,000,000 ETH');
  }

  return price;
}

/**
 * Validate Farcaster FID
 */
export function validateFid(fid: unknown): number {
  const num = Number(fid);

  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError('FID must be a valid number');
  }

  if (num < 1 || num > 999999999) {
    throw new ValidationError('Invalid FID range');
  }

  if (!Number.isInteger(num)) {
    throw new ValidationError('FID must be an integer');
  }

  return num;
}

/**
 * Validate URL
 */
export function validateUrl(url: unknown): string {
  if (typeof url !== 'string') {
    throw new ValidationError('URL must be a string');
  }

  try {
    const parsed = new URL(url);
    
    // Only allow https in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      throw new ValidationError('Only HTTPS URLs allowed in production');
    }

    // Whitelist allowed domains
    const allowedDomains = [
      'echain.app',
      'localhost',
      'vercel.app',
      'farcaster.xyz',
      'warpcast.com',
    ];

    const domain = parsed.hostname.replace(/^www\./, '');
    const isAllowed = allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      throw new ValidationError('URL domain not allowed');
    }

    return url;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid URL format');
  }
}

/**
 * Validate transaction hash
 */
export function validateTxHash(hash: unknown): string {
  if (typeof hash !== 'string') {
    throw new ValidationError('Transaction hash must be a string');
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    throw new ValidationError('Invalid transaction hash format');
  }

  return hash.toLowerCase();
}

/**
 * Validate hex data
 */
export function validateHexData(data: unknown): string {
  if (typeof data !== 'string') {
    throw new ValidationError('Hex data must be a string');
  }

  if (!/^0x[a-fA-F0-9]*$/.test(data)) {
    throw new ValidationError('Invalid hex data format');
  }

  if (data.length > 10000) {
    throw new ValidationError('Hex data too long');
  }

  return data.toLowerCase();
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: unknown): number {
  const num = Number(timestamp);

  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError('Timestamp must be a valid number');
  }

  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const oneYearFuture = now + 365 * 24 * 60 * 60 * 1000;

  if (num < oneYearAgo || num > oneYearFuture) {
    throw new ValidationError('Timestamp out of valid range');
  }

  return num;
}

/**
 * Sanitize user input string
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters and null bytes
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate JSON object
 */
export function validateJson<T>(data: unknown, schema?: (data: any) => boolean): T {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ValidationError('Data must be a valid JSON object');
  }

  if (schema && !schema(data)) {
    throw new ValidationError('Data does not match required schema');
  }

  return data as T;
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate Frame button index
 */
export function validateButtonIndex(index: unknown): number {
  const num = Number(index);

  if (isNaN(num) || !Number.isInteger(num)) {
    throw new ValidationError('Button index must be an integer');
  }

  if (num < 1 || num > 4) {
    throw new ValidationError('Button index must be between 1 and 4');
  }

  return num;
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: unknown): number {
  const num = Number(chainId);

  if (isNaN(num) || !Number.isInteger(num)) {
    throw new ValidationError('Chain ID must be an integer');
  }

  // Known chain IDs
  const validChains = [
    1, // Ethereum mainnet
    8453, // Base mainnet
    84532, // Base Sepolia testnet
    11155111, // Sepolia testnet
  ];

  if (!validChains.includes(num)) {
    throw new ValidationError('Unsupported chain ID');
  }

  return num;
}
