'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function WebSocketTest() {
  const { isConnected, isConnecting, error, emit, on, joinEvent, leaveEvent } = useWebSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [eventId, setEventId] = useState('test-event-1');

  // Listen for test messages
  useEffect(() => {
    const handleTestMessage = (data: any) => {
      setMessages(prev => [...prev, `Received: ${JSON.stringify(data)}`]);
    };

    const handleBroadcastMessage = (data: any) => {
      setMessages(prev => [...prev, `Broadcast: ${JSON.stringify(data)}`]);
    };

    on('test-message', handleTestMessage);
    on('broadcast-message', handleBroadcastMessage);

    return () => {
      // Cleanup listeners on unmount
    };
  }, [on]);

  const sendTestMessage = () => {
    if (inputMessage.trim()) {
      emit('test-message', { message: inputMessage, timestamp: new Date().toISOString() });
      setMessages(prev => [...prev, `Sent: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  const joinTestEvent = () => {
    joinEvent(eventId);
    setMessages(prev => [...prev, `Joined event: ${eventId}`]);
  };

  const leaveTestEvent = () => {
    leaveEvent(eventId);
    setMessages(prev => [...prev, `Left event: ${eventId}`]);
  };

  const testBroadcast = () => {
    emit('broadcast-to-event', { eventId, message: 'Test broadcast', timestamp: new Date().toISOString() });
    setMessages(prev => [...prev, `Broadcasting to event: ${eventId}`]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">WebSocket Test Interface</h2>

      {/* Connection Status */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <span>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">Error: {error}</p>}
      </div>

      {/* Event Room Management */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Event Room Management</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Event ID"
            className="flex-1 px-3 py-1 border rounded"
          />
          <button
            onClick={joinTestEvent}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Event
          </button>
          <button
            onClick={leaveTestEvent}
            className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave Event
          </button>
        </div>
        <button
          onClick={testBroadcast}
          className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Broadcast
        </button>
      </div>

      {/* Message Testing */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Send Test Message</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter test message"
            className="flex-1 px-3 py-1 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Message Log */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Message Log</h3>
        <div className="max-h-64 overflow-y-auto bg-gray-50 p-2 rounded">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {msg}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setMessages([])}
          className="mt-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}