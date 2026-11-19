const KEYGEN_PATH = '/api/lookup-key';

let cachedKey = null;
let cachedExpiresAt = 0;

function readEnvValue(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function loadEnvFile() {
  // Keep this tiny loader dependency-free and server-only.
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function keygenError(message, fix, code = 'KEYGEN_ERROR') {
  const error = new Error(message);
  error.fix = fix;
  error.code = code;
  return error;
}

function clearKey() {
  cachedKey = null;
  cachedExpiresAt = 0;
}

async function getKey() {
  loadEnvFile();
  if (cachedKey && Date.now() < cachedExpiresAt) return cachedKey;

  const keygenUrl = readEnvValue('KEYGEN_URL');
  const token = readEnvValue('KEYGEN_TOKEN');
  if (!keygenUrl || keygenUrl === 'paste-here' || !token || token === 'paste-here') {
    throw keygenError('The AI key service is not configured yet.', 'Add KEYGEN_URL and KEYGEN_TOKEN to the server .env file.');
  }

  let response;
  try {
    response = await fetch(`${keygenUrl.replace(/\/+$/, '')}${KEYGEN_PATH}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    throw keygenError('The AI key service could not be reached.', 'Check the server internet connection and KEYGEN_URL, then try again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw keygenError('The AI key service returned an unreadable response.', 'Check the MindDo key service and try again.');
  }
  if (!response.ok || typeof data.apiKey !== 'string' || !data.apiKey || !data.expiresAt) {
    throw keygenError('The AI key service could not provide an AI key.', 'Check KEYGEN_TOKEN and MindDo access, then try again.');
  }

  const expiresAt = Date.parse(data.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw keygenError('The AI key service returned an expired AI key.', 'Check the MindDo response and try again.');
  }
  cachedKey = data.apiKey;
  // Refresh a little early so a request does not begin with an almost-expired key.
  cachedExpiresAt = Math.max(Date.now() + 1000, expiresAt - 5000);
  return cachedKey;
}

module.exports = { getKey, clearKey };
