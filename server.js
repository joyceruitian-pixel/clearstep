const http = require('http');
const fs = require('fs');
const path = require('path');
const { explainInstructions } = require('./lib/openai');

const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function serveFile(requestPath, response) {
  const cleanPath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.normalize(path.join(publicDir, cleanPath));
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && (request.url === '/api/explain' || request.url === '/api/explain-simply')) {
    try {
      const payload = JSON.parse(await readBody(request));
      const instructions = typeof payload.instructions === 'string' ? payload.instructions.trim() : '';
      if (!instructions) return sendJson(response, 400, { error: 'Please paste your homework instructions first.' });
      if (instructions.length > 12000) return sendJson(response, 400, { error: 'That is a little too long. Try pasting the most important directions.' });
      const result = await explainInstructions(instructions, { simpler: request.url === '/api/explain-simply' });
      return sendJson(response, 200, { result });
    } catch (error) {
      const message = error && error.code === 'OPENAI_AUTH' ? 'I could not connect to the AI. Please check the key in your .env file.' : 'I could not explain that right now. Please check your key and internet connection, then try again.';
      return sendJson(response, 502, { error: message });
    }
  }
  if (request.method === 'GET') return serveFile(request.url.split('?')[0], response);
  sendJson(response, 405, { error: 'Method not allowed.' });
});

server.listen(PORT, () => console.log(`ClearStep is running at http://localhost:${PORT}`));
