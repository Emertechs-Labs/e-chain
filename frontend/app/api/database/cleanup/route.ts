import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Initialize Turso client
const client = process.env.TURSO_DATABASE_URL ? createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    const { action, dryRun = true } = await request.json();

    if (action !== 'cleanup-placeholder-events') {
      return NextResponse.json({ 
        error: 'Invalid action. Use "cleanup-placeholder-events"' 
      }, { status: 400 });
    }

    // Find all placeholder events
    const placeholderEvents = await client.execute(`
      SELECT id, name, metadata_uri, organizer, created_at 
      FROM events 
      WHERE 
        name = 'Cardano Community Meetup' 
        OR metadata_uri = 'ipfs://placeholder' 
        OR name = 'Test001'
        OR name LIKE '%test%'
        OR name LIKE '%Test%'
      ORDER BY id
    `);

    const eventsToDelete = placeholderEvents.rows.map(row => ({
      id: row.id,
      name: row.name,
      metadataURI: row.metadata_uri,
      organizer: row.organizer,
      createdAt: row.created_at
    }));

    if (eventsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No placeholder events found to clean up',
        eventsFound: 0,
        eventsDeleted: 0
      });
    }

    let deletedCount = 0;
    
    if (!dryRun) {
      // Actually delete the events
      for (const event of eventsToDelete) {
        await client.execute({
          sql: 'DELETE FROM events WHERE id = ?',
          args: [event.id]
        });
        deletedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun ? 'Dry run completed - no events were deleted' : `Successfully deleted ${deletedCount} placeholder events`,
      eventsFound: eventsToDelete.length,
      eventsDeleted: deletedCount,
      placeholderEvents: eventsToDelete
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json({
      error: 'Database cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    // Just analyze what would be deleted
    const placeholderEvents = await client.execute(`
      SELECT id, name, metadata_uri, organizer, created_at 
      FROM events 
      WHERE 
        name = 'Cardano Community Meetup' 
        OR metadata_uri = 'ipfs://placeholder' 
        OR name = 'Test001'
        OR name LIKE '%test%'
        OR name LIKE '%Test%'
      ORDER BY id
    `);

    const totalEvents = await client.execute('SELECT COUNT(*) as count FROM events');

    return NextResponse.json({
      totalEvents: totalEvents.rows[0].count,
      placeholderEventsCount: placeholderEvents.rows.length,
      placeholderEvents: placeholderEvents.rows.map(row => ({
        id: row.id,
        name: row.name,
        metadataURI: row.metadata_uri,
        organizer: row.organizer,
        createdAt: row.created_at
      }))
    });

  } catch (error) {
    console.error('Database analysis error:', error);
    return NextResponse.json({
      error: 'Database analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}