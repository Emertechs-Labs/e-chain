import { NextRequest, NextResponse } from 'next/server';
import { blobHelpers } from '@/lib/blob';
import { edgeConfigHelpers } from '@/lib/edge-config';

// Example API route demonstrating Vercel Blob and Edge Config storage services
export async function GET() {
  try {
    // Test Edge Config
    const appConfig = await edgeConfigHelpers.getAppConfig();
    const featureFlags = await edgeConfigHelpers.getFeatureFlags();

    // Test Blob (list files)
    const blobs = await blobHelpers.listFiles('events/');

    return NextResponse.json({
      message: 'Storage services test successful',
      data: {
        edgeConfig: {
          appConfig,
          featureFlags
        },
        blob: {
          fileCount: blobs.length,
          files: blobs.slice(0, 5) // First 5 files
        }
      }
    });
  } catch (error) {
    console.error('Storage test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Storage services test failed', details: errorMessage },
      { status: 500 }
    );
  }
}

// Example POST endpoint for file uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to Blob storage
    const blob = await blobHelpers.uploadFile(file, folder);

    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        size: blob.size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'File upload failed', details: errorMessage },
      { status: 500 }
    );
  }
}