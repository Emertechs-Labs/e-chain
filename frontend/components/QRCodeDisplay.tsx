"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './QRCodeDisplay.module.css';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  title?: string;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 256,
  title = "QR Code",
  className = ""
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const QRCode = (await import('qrcode')).default;

        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white rounded-lg ${className}`} 
           style={{width: size, height: size}}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !qrCodeUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
           style={{width: size, height: size}}>
        <div className="text-center text-gray-500 text-sm">
          <div className="text-red-500 mb-2">⚠️</div>
          <div>QR Code Error</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg ${className}`}>
      <Image
        src={qrCodeUrl}
        alt={title}
        width={size}
        height={size}
        className="rounded"
        priority
      />
      {title && (
        <p className="text-center text-sm text-gray-600 mt-2">{title}</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;