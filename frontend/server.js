import { createServer } from 'http';
import { createServer as createNetServer } from 'net';
import { parse } from 'url';
import next from 'next';

(async () => {
  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  let port = parseInt(process.env.PORT, 10) || 3000;

  // Function to find an available port starting from the given port
  async function findAvailablePort(startPort) {
    let port = startPort;
    while (true) {
      try {
        await new Promise((resolve, reject) => {
          const server = createNetServer();
          server.listen(port, () => {
            server.close(() => resolve());
          });
          server.on('error', reject);
        });
        return port;
      } catch (err) {
        port++;
      }
    }
  }

  // Find an available port
  port = await findAvailablePort(port);

  // when using middleware `hostname` and `port` must be provided below
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(async () => {
    const httpServer = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    // Initialize Socket.IO server
    const { initSocketIO } = await import('./app/api/websockets/route.ts');
    const io = initSocketIO(httpServer);

    httpServer.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server ready on ws://${hostname}:${port}/api/websockets`);
    });
  });
})();