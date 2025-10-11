import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
}

/**
 * Custom hook for managing WebSocket connections using Socket.IO
 * Provides real-time bidirectional communication for event-driven features
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    path = '/api/websockets',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    socketRef.current = io(url, {
      path,
      autoConnect: true,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      setIsConnecting(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        setError('Server disconnected');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setIsConnecting(false);
      setError(err.message || 'Connection failed');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      console.error('❌ WebSocket reconnection error:', err);
      setError('Reconnection failed');
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      setError('Reconnection failed');
      setIsConnecting(false);
    });
  }, [url, path, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Disconnect socket
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  };

  // Emit event to server
  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: WebSocket not connected');
    }
  };

  // Listen for events from server
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Join event room
  const joinEvent = (eventId: string) => {
    emit('join-event', eventId);
  };

  // Leave event room
  const leaveEvent = (eventId: string) => {
    emit('leave-event', eventId);
  };

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeat = setInterval(() => {
      emit('ping');
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeat);
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinEvent,
    leaveEvent,
  };
}