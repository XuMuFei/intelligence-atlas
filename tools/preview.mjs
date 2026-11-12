import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('E:/AI/xzfnn/web');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!p.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (url.pathname === '/' || url.pathname === '') p = path.join(ROOT, 'index.html');
  fs.readFile(p, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(p)] || 'application/octet-stream',
      'Cache-Control': 'no-store, must-revalidate',
    });
    res.end(buf);
  });
}).listen(4174, '127.0.0.1', () => console.log('preview on http://127.0.0.1:4174'));