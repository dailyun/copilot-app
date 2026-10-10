import { createReadStream, readFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { searchStalls, sortStalls } from './stalls.js';

const rootDir = join(fileURLToPath(new URL('..', import.meta.url)));
const publicDir = join(rootDir, 'public');
const stalls = JSON.parse(readFileSync(new URL('./data/stalls.json', import.meta.url), 'utf8'));

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, pathname) {
  const fileName = pathname === '/' ? 'index.html' : pathname.slice(1);

  if (!['index.html', 'styles.css', 'app.js'].includes(fileName)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const filePath = join(publicDir, fileName);
  res.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

export function createServer() {
  return createHttpServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/stalls') {
      try {
        const query = url.searchParams.get('q') ?? '';
        const sortKey = url.searchParams.get('sort') ?? 'rating';
        const matches = searchStalls(stalls, query);
        sendJson(res, 200, sortStalls(matches, sortKey));
      } catch (error) {
        sendJson(res, 500, { error: 'Unable to search stalls right now.' });
      }
      return;
    }

    if (req.method === 'GET') {
      serveStatic(res, url.pathname);
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Hawker Hub running at http://localhost:${port}`);
  });
}
