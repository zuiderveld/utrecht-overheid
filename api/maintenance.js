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
    const { list } = require('@vercel/blob');
    const { blobs } = await list({ prefix: BLOB_PATHNAME, token: blobToken });
    const match = blobs.find((b) => b.pathname === BLOB_PATHNAME) || blobs[0];
    if (!match?.url) return null;
    const res = await fetch(match.url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function saveToBlob(state) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      'Vercel Blob niet geconfigureerd. Maak een Blob store aan in Vercel en koppel BLOB_READ_WRITE_TOKEN.'
    );
  }
  const { put } = require('@vercel/blob');
  await put(BLOB_PATHNAME, JSON.stringify(state), {
    access: 'public',
    token: blobToken,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function getMaintenanceState() {
  const fromBlob = await loadFromBlob();
  if (fromBlob) return fromBlob;
  return readDefaultFile();
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
      return res.status(200).json({ ok: true, maintenance: state });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Alleen GET of POST' });
};
