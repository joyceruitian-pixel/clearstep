const http = require('http');
const fs = require('fs');
const path = require('path');
const { explainInstructions } = require('./lib/openai');

const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const VALID_GRADE_LEVELS = new Set(['simple', 'grade-5', 'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12']);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function sendError(response, statusCode, message, fix) {
  console.error(fix);
  return sendJson(response, statusCode, { error: { message, fix } });
}

function serveFile(requestPath, response) {
  const cleanPath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.normalize(path.join(publicDir, cleanPath));
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
    sendError(response, 404, 'That page was not found.', 'Check the URL and try again.');
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
      const gradeLevel = VALID_GRADE_LEVELS.has(payload.gradeLevel) ? payload.gradeLevel : 'simple';
      if (!instructions) return sendError(response, 400, 'Please paste your homework instructions first.', 'Paste the directions into the box, then try again.');
      if (instructions.length > 12000) return sendError(response, 400, 'That is a little too long. Try pasting the most important directions.', 'Shorten the pasted directions and try again.');
      const result = await explainInstructions(instructions, { simpler: request.url === '/api/explain-simply', gradeLevel });
      return sendJson(response, 200, { result });
    } catch (error) {
      const message = error?.message || 'I could not explain that right now.';
      const fix = error?.fix || 'Check the server connection and try again.';
      return sendError(response, 502, message, fix);
    }
  }
  if (request.method === 'GET') return serveFile(request.url.split('?')[0], response);
  sendError(response, 405, 'That request method is not allowed.', 'Try loading the page again or use the Explain action.');
});

server.listen(PORT, () => console.log(`ClearStep is running at http://localhost:${PORT}`));
