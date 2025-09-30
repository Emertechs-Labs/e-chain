// IPFS upload utility for event images and metadata
// Using Pinata for IPFS storage and pinning

import { PinataSDK } from 'pinata-web3';
import QRCode from 'qrcode';

// Initialize Pinata SDK
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';

let pinataSDK: PinataSDK | null = null;

function getPinataSDK(): PinataSDK {
  if (!pinataSDK && PINATA_JWT) {
    pinataSDK = new PinataSDK({
      pinataJwt: PINATA_JWT,
      pinataGateway: PINATA_GATEWAY_URL,
    });
  }
  return pinataSDK!;
}

export interface IPFSUploadResult {
  cid: string;
  url: string;
  success: boolean;
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
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    const pinata = getPinataSDK();

    // Upload file to Pinata
    const upload = await pinata.upload.file(file);

    return {
      cid: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      success: true,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    const pinata = getPinataSDK();

    // Convert metadata to JSON blob and then to File
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    const metadataFile = new File([metadataBlob], 'event-metadata.json', { type: 'application/json' });

    // Upload JSON to Pinata
    const upload = await pinata.upload.file(metadataFile);

    return {
      cid: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      success: true,
    };
  } catch (error) {
    console.error('Metadata upload error:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    const pinata = getPinataSDK();

    // Convert metadata to JSON blob and then to File
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    const metadataFile = new File([metadataBlob], 'ticket-metadata.json', { type: 'application/json' });

    // Upload JSON to Pinata
    const upload = await pinata.upload.file(metadataFile);

    return {
      cid: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      success: true,
    };
  } catch (error) {
    console.error('Ticket metadata upload error:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload verification data to IPFS
 */
export async function uploadVerificationData(verificationData: VerificationData): Promise<IPFSUploadResult> {
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    const pinata = getPinataSDK();

    // Create verification data blob and convert to File
    const verificationBlob = new Blob([JSON.stringify({
      ...verificationData,
      verified: true,
      verificationUrl: `https://etherscan.io/tx/${verificationData.transactionHash}`,
      ipfsTimestamp: Date.now(),
    })], {
      type: 'application/json',
    });
    const verificationFile = new File([verificationBlob], 'verification.json', { type: 'application/json' });

    // Upload JSON to Pinata
    const upload = await pinata.upload.file(verificationFile);

    return {
      cid: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
      success: true,
    };
  } catch (error) {
    console.error('Verification data upload error:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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

    // Create verification URL that points to the IPFS data
    const verificationUrl = `https://verify.echain.events/${ipfsResult.cid}`;

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
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Alternative: Use a simple fallback that returns a placeholder
 * This can be used when IPFS services are not configured
 */
export function getPlaceholderIPFSUrl(filename: string = 'event'): string {
  // Return a placeholder IPFS URL for development
  return `ipfs://placeholder-${filename}-${Date.now()}`;
}

/**
 * Get verification URL for a transaction hash
 */
export function getVerificationUrl(transactionHash: string, ipfsCid?: string): string {
  if (ipfsCid) {
    return `https://verify.echain.events/${ipfsCid}`;
  }
  return `https://etherscan.io/tx/${transactionHash}`;
}