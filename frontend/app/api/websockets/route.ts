import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;

// Initialize Socket.IO server
function initSocketIO(httpServer: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: '/api/websockets',
    cors: {
      origin: true, // Allow all origins in development
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    // Handle client joining event rooms
    socket.on('join-event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`📱 Client ${socket.id} joined event room: ${eventId}`);
    });

    // Handle client leaving event rooms
    socket.on('leave-event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`📱 Client ${socket.id} left event room: ${eventId}`);
    });

    // Handle heartbeat/ping from client
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle test messages
    socket.on('test-message', (data) => {
      console.log(`📨 Test message from ${socket.id}:`, data);
      // Echo back the message for testing
      socket.emit('test-message', { ...data, echoed: true });
    });

    // Handle broadcast to event room
    socket.on('broadcast-to-event', (data) => {
      const { eventId, ...messageData } = data;
      console.log(`📡 Broadcasting to event ${eventId}:`, messageData);
      io!.to(`event:${eventId}`).emit('broadcast-message', messageData);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${socket.id}:`, error);
    });
  });

  console.log('🚀 WebSocket server initialized and ready');
  return io;
}

// Broadcast function for use by other parts of the application
export function broadcastToEvent(eventId: string, event: string, data: any) {
  if (io) {
    io.to(`event:${eventId}`).emit(event, data);
    console.log(`📡 Broadcasted ${event} to event room ${eventId}`);
  } else {
    console.warn('⚠️ WebSocket server not initialized, cannot broadcast');
  }
}

// Get server stats
export function getWebSocketStats() {
  if (!io) {
    return { initialized: false };
  }

  const rooms = Array.from(io.sockets.adapter.rooms.keys());
  const connectedSockets = io.sockets.sockets.size;

  return {
    initialized: true,
    connectedSockets,
    rooms: rooms.length,
    roomNames: rooms,
  };
}

// Next.js API route handler
export async function GET(request: NextRequest) {
  // This endpoint serves as a health check for the WebSocket server
  const stats = getWebSocketStats();

  return Response.json({
    status: 'WebSocket server endpoint',
    websocketReady: stats.initialized,
    connectedSockets: stats.connectedSockets || 0,
    timestamp: new Date().toISOString(),
  });
}

// Export the init function for use in the main server
export { initSocketIO };