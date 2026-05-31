const fs = require('fs');
const path = require('path');
const checkIsBeheer = require('./lib/beheer-check');

const DEFAULT_STATE = {
  global: false,
  message: 'Deze website is momenteel in onderhoud. Probeer het later opnieuw.',
  diensten: { politie: false, kmar: false, ambulance: false, pechhulp: false },
  updatedAt: null,
};

const BLOB_PATHNAME = 'urp-maintenance-state.json';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readDefaultFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'maintenance.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function loadFromBlob() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return null;

  try {
    const { head, list } = require('@vercel/blob');

    try {
      const meta = await head(BLOB_PATHNAME, { token: blobToken });
      if (meta?.url) {
        const res = await fetch(meta.url, { cache: 'no-store' });
        if (res.ok) return await res.json();
      }
    } catch {
      /* head faalt als blob nog niet bestaat */
    }

    const { blobs } = await list({ prefix: BLOB_PATHNAME, token: blobToken });
    const match =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ||
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    if (!match?.url) return null;

    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Blob laden mislukt:', err);
    return null;
  }
}

async function saveToBlob(state) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      'Vercel Blob niet geconfigureerd. Maak een Blob store in Vercel → Storage → Blob en redeploy (BLOB_READ_WRITE_TOKEN).'
    );
  }
  const { put } = require('@vercel/blob');
  const result = await put(BLOB_PATHNAME, JSON.stringify(state), {
    access: 'public',
    token: blobToken,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  return result;
}

async function getMaintenanceState() {
  if (process.env.MAINTENANCE_FORCE_OFF === 'true') {
    return { ...readDefaultFile(), global: false, _storage: 'force-off' };
  }

  const fromBlob = await loadFromBlob();
  if (fromBlob) {
    return { ...fromBlob, _storage: 'blob' };
  }
  return { ...readDefaultFile(), _storage: 'default' };
}

function normalizeState(input) {
  const base = readDefaultFile();
  return {
    global: !!input.global,
    message: (input.message || base.message || DEFAULT_STATE.message).trim(),
    diensten: {
      politie: !!input.diensten?.politie,
      kmar: !!input.diensten?.kmar,
      ambulance: !!input.diensten?.ambulance,
      pechhulp: !!input.diensten?.pechhulp,
    },
    updatedAt: new Date().toISOString(),
  };
}

module.exports = async function handler(req, res) {
  cors(res);
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const state = await getMaintenanceState();
    return res.status(200).json(state);
  }

  if (req.method === 'POST') {
    const accessToken = req.body?.accessToken;
    const beheer = await checkIsBeheer(accessToken);
    if (!beheer.ok) {
      return res.status(403).json({ error: beheer.error });
    }

    try {
      const state = normalizeState(req.body?.maintenance || {});
      await saveToBlob(state);
      return res.status(200).json({
        ok: true,
        maintenance: { ...state, _storage: 'blob' },
      });
    } catch (err) {
      console.error('Onderhoud opslaan:', err);
      return res.status(500).json({ error: err.message || 'Opslaan mislukt' });
    }
  }

  return res.status(405).json({ error: 'Alleen GET of POST' });
};
