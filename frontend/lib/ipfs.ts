// IPFS upload utility for event images and metadata
// Using Pinata for IPFS storage and pinning

import { PinataSDK } from 'pinata-web3';
import QRCode from 'qrcode';
import { blobHelpers } from './blob';

// Initialize Pinata SDK
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
const PINATA_MAX_RETRIES = 3;
const PINATA_RETRY_DELAY_MS = 500;
const BLOB_FALLBACK_FOLDER = 'ipfs-fallback';

let pinataSDK: PinataSDK | null = null;

function getPinataSDK(): PinataSDK {
  if (!pinataSDK && PINATA_JWT) {
    try {
      pinataSDK = new PinataSDK({
        pinataJwt: PINATA_JWT,
        pinataGateway: PINATA_GATEWAY_URL,
      });
      console.log('Pinata SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pinata SDK:', error);
      pinataSDK = null;
    }
  }
  return pinataSDK!;
}

export interface IPFSUploadResult {
  cid: string;
  url: string;
  success: boolean;
  storage: 'ipfs' | 'blob';
  error?: string;
}

export interface VerificationData {
  eventId: number;
  eventName: string;
  organizer: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  ticketId?: number;
  attendeeAddress?: string;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  const pinataEnabled = Boolean(PINATA_JWT);
  if (pinataEnabled) {
    const pinataResult = await uploadFileWithPinataRetry(file, 'asset');
    if (pinataResult.success) {
      return pinataResult;
    }
    console.error('uploadToIPFS: Pinata upload failed, falling back to blob storage:', pinataResult.error);
  } else {
    console.warn('uploadToIPFS: Pinata not configured, using blob fallback');
  }

  const fallbackResult = await uploadFileToBlob(file, 'event-assets');
  if (fallbackResult.success) {
    return fallbackResult;
  }

  return {
    cid: '',
    url: '',
    success: false,
    storage: 'blob',
    error: fallbackResult.error || 'Unknown blob fallback error'
  };
}

/**
 * Upload event metadata to IPFS
 */
export async function uploadEventMetadata(metadata: {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}): Promise<IPFSUploadResult> {
  const metadataFile = createJsonFile(metadata, 'event-metadata');
  const pinataEnabled = Boolean(PINATA_JWT);

  if (pinataEnabled) {
    const pinataResult = await uploadFileWithPinataRetry(metadataFile, 'event-metadata');
    if (pinataResult.success) {
      return pinataResult;
    }
    console.error('uploadEventMetadata: Pinata upload failed, using blob fallback:', pinataResult.error);
  } else {
    console.warn('uploadEventMetadata: Pinata not configured, using blob fallback');
  }

  return await uploadFileToBlob(metadataFile, `${BLOB_FALLBACK_FOLDER}/metadata`);
}

/**
 * Upload ticket metadata to IPFS
 */
export async function uploadTicketMetadata(metadata: {
  name: string;
  description: string;
  image?: string;
  eventId: number;
  eventName: string;
  ticketId: number;
  seatNumber?: number;
  tier: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}): Promise<IPFSUploadResult> {
  const metadataFile = createJsonFile(metadata, 'ticket-metadata');
  const pinataEnabled = Boolean(PINATA_JWT);

  if (pinataEnabled) {
    const pinataResult = await uploadFileWithPinataRetry(metadataFile, `ticket-${metadata.ticketId}`);
    if (pinataResult.success) {
      return pinataResult;
    }
    console.error('uploadTicketMetadata: Pinata upload failed, using blob fallback:', pinataResult.error);
  } else {
    console.warn('uploadTicketMetadata: Pinata not configured, using blob fallback');
  }

  return await uploadFileToBlob(metadataFile, `${BLOB_FALLBACK_FOLDER}/tickets`);
}

/**
 * Upload verification data to IPFS
 */
export async function uploadVerificationData(verificationData: VerificationData): Promise<IPFSUploadResult> {
  const verificationFile = createJsonFile({
    ...verificationData,
    verified: true,
    verificationUrl: `https://basescan.org/tx/${verificationData.transactionHash}`,
    ipfsTimestamp: Date.now(),
  }, 'verification');

  const pinataEnabled = Boolean(PINATA_JWT);

  if (pinataEnabled) {
    const pinataResult = await uploadFileWithPinataRetry(verificationFile, `verification-${verificationData.transactionHash}`);
    if (pinataResult.success) {
      return pinataResult;
    }
    console.error('uploadVerificationData: Pinata upload failed, using blob fallback:', pinataResult.error);
  } else {
    console.warn('uploadVerificationData: Pinata not configured, using blob fallback');
  }

  return await uploadFileToBlob(verificationFile, `${BLOB_FALLBACK_FOLDER}/verification`);
}

/**
 * Generate QR code data URL for verification
 */
export async function generateVerificationQR(verificationData: VerificationData): Promise<string> {
  try {
    // Upload verification data to IPFS first
    const ipfsResult = await uploadVerificationData(verificationData);
    if (!ipfsResult.success) {
      throw new Error('Failed to upload verification data to IPFS');
    }

    // Create verification URL that points to BaseScan transaction page
    const verificationUrl = `https://basescan.org/tx/${verificationData.transactionHash}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
}

/**
 * Generate event poster with embedded QR code
 */
export async function generateEventPosterWithQR(
  eventData: {
    name: string;
    description: string;
    date: string;
    venue: string;
    organizer: string;
  },
  verificationData: VerificationData,
  posterImage?: File
): Promise<IPFSUploadResult> {
  try {
    // Generate QR code
    const qrCodeData = await generateVerificationQR(verificationData);

    // Create poster metadata
    const posterMetadata: {
      name: string;
      description: string;
      event: typeof eventData;
      verification: {
        qrCode: string;
        ipfsUrl: string;
        transactionHash: string;
      };
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
      image?: string;
    } = {
      name: `${eventData.name} - Event Poster`,
      description: `Official event poster for ${eventData.name} with verification QR code`,
      event: eventData,
      verification: {
        qrCode: qrCodeData,
        ipfsUrl: `https://ipfs.io/ipfs/${verificationData.transactionHash}`,
        transactionHash: verificationData.transactionHash,
      },
      attributes: [
        { trait_type: 'Event Type', value: 'Verification Poster' },
        { trait_type: 'Verification Enabled', value: 'True' },
        { trait_type: 'Organizer', value: eventData.organizer },
      ],
    };

    // If poster image provided, upload it
    let imageUrl = '';
    if (posterImage) {
      const imageResult = await uploadToIPFS(posterImage);
      if (imageResult.success) {
        imageUrl = imageResult.url;
        posterMetadata.image = imageUrl;
      } else {
        console.warn('generateEventPosterWithQR: Failed to upload poster image, proceeding without image');
      }
    }

    // Upload poster metadata
    return await uploadEventMetadata(posterMetadata);
  } catch (error) {
    console.error('Event poster generation error:', error);
    return {
      cid: '',
      url: '',
      success: false,
      storage: 'blob',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get verification URL for a transaction hash
 */
export function getVerificationUrl(transactionHash: string, ipfsCid?: string): string {
  if (ipfsCid) {
    return `https://verify.echain.events/${ipfsCid}`;
  }
  return `https://basescan.org/tx/${transactionHash}`;
}

// ============ Internal helpers ============

function createJsonFile(data: unknown, prefix: string): File {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return new File([blob], `${prefix}-${Date.now()}.json`, { type: 'application/json' });
}

async function uploadFileWithPinataRetry(file: File, context: string): Promise<IPFSUploadResult> {
  const pinata = getPinataSDK();
  if (!pinata) {
    return {
      cid: '',
      url: '',
      success: false,
      storage: 'ipfs',
      error: 'Failed to initialize Pinata SDK'
    };
  }

  for (let attempt = 0; attempt < PINATA_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = PINATA_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const upload = await pinata.upload.file(file);
      return {
        cid: upload.IpfsHash,
        url: `${PINATA_GATEWAY_URL}/ipfs/${upload.IpfsHash}`,
        success: true,
        storage: 'ipfs'
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Pinata error';
      console.warn(`uploadFileWithPinataRetry: Attempt ${attempt + 1} failed for ${context}:`, message);
      if (attempt === PINATA_MAX_RETRIES - 1) {
        return {
          cid: '',
          url: '',
          success: false,
          storage: 'ipfs',
          error: message
        };
      }
    }
  }

  return {
    cid: '',
    url: '',
    success: false,
    storage: 'ipfs',
    error: 'Unknown Pinata failure'
  };
}

async function uploadFileToBlob(file: File, folder: string): Promise<IPFSUploadResult> {
  try {
    const result = await blobHelpers.uploadFile(file, folder || BLOB_FALLBACK_FOLDER);
    return {
      cid: '',
      url: result.url,
      success: true,
      storage: 'blob'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown blob error';
    console.error('uploadFileToBlob: Failed to upload file to blob storage:', message);
    return {
      cid: '',
      url: '',
      success: false,
      storage: 'blob',
      error: message
    };
  }
}