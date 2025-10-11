import WebSocketTest from '../components/WebSocketTest';

export default function WebSocketTestPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Echain WebSocket Test
            </h1>
            <div className="text-sm text-gray-500">
              Sprint 1 - WebSocket Server Setup
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <WebSocketTest />
      </main>
    </div>
  );
}