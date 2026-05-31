/**
 * Vercel serverless: Discord login + rol-check
 * Role ID's: api/discord-roles.js (GitHub) of Vercel Environment Variables
 */

const rolesFile = require('./discord-roles');

const ROL_CONFIG = [
  { env: 'DISCORD_ROLE_POLITIE', key: 'politie', dienst: 'politie' },
  { env: 'DISCORD_ROLE_KMAR', key: 'kmar', dienst: 'kmar' },
  { env: 'DISCORD_ROLE_AMBULANCE', key: 'ambulance', dienst: 'ambulance' },
  { env: 'DISCORD_ROLE_PECHHULP', key: 'pechhulp', dienst: 'pechhulp' },
];

const GELDIGE_DIENSTEN = ['politie', 'kmar', 'ambulance', 'pechhulp'];

function getRoleId(envName, fileKey) {
  const fromEnv = process.env[envName];
  if (fromEnv) return fromEnv;
  const fromFile = rolesFile[fileKey];
  return fromFile || null;
}

function heeftRol(userRoles, dienst) {
  const row = ROL_CONFIG.find((r) => r.dienst === dienst);
  if (!row) return false;
  const roleId = getRoleId(row.env, row.key);
  return roleId && userRoles.includes(roleId);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });

  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const ibtRoleId = getRoleId('DISCORD_ROLE_IBT', 'ibt') || getRoleId('DISCORD_ROLE_IBT_DOCENT', 'ibtDocent');
  const politieAdminRoleId = getRoleId('DISCORD_ROLE_POLITIE_ADMIN', 'politieAdmin');
  const beheerRoleId = getRoleId('DISCORD_ROLE_BEHEER', 'beheer');

  if (!token || !guildId) {
    return res.status(500).json({
      error: 'Zet DISCORD_BOT_TOKEN en DISCORD_GUILD_ID in Vercel → Settings → Environment Variables.',
    });
  }

  const accessToken = req.body?.accessToken;
  const requestedDienst = req.body?.requestedDienst;

  if (!accessToken) {
    return res.status(400).json({ error: 'Geen access token' });
  }
  if (!requestedDienst || !GELDIGE_DIENSTEN.includes(requestedDienst)) {
    return res.status(400).json({ error: 'Kies eerst een dienst (Politie, KMar, Ambulance of Pechhulp).' });
  }

  try {
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Discord token ongeldig of verlopen' });
    }
    const user = await userRes.json();

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
      { headers: { Authorization: `Bot ${token}` } }
    );
    if (!memberRes.ok) {
      return res.status(403).json({
        error: 'Je zit niet op de URP Discord server, of de bot mist rechten om leden te lezen.',
      });
    }
    const member = await memberRes.json();
    const userRoles = member.roles || [];

    const isBeheer = beheerRoleId && userRoles.includes(beheerRoleId);
    const isIbt = ibtRoleId ? userRoles.includes(ibtRoleId) : false;
    const isPolitieAdmin = politieAdminRoleId ? userRoles.includes(politieAdminRoleId) : false;
    const isIbtDocent = isIbt || isPolitieAdmin;
    const username = member.nick || user.global_name || user.username;

    const authPayload = {
      dienst: requestedDienst,
      username,
      isIbt,
      isPolitieAdmin,
      isIbtDocent,
      isBeheer: !!isBeheer,
    };

    if (isBeheer) {
      return res.status(200).json(authPayload);
    }

    const heeftDienstRol = heeftRol(userRoles, requestedDienst);
    const politieViaAdmin = requestedDienst === 'politie' && isPolitieAdmin;

    if (!heeftDienstRol && !politieViaAdmin) {
      const namen = { politie: 'Politie', kmar: 'KMar', ambulance: 'Ambulance', pechhulp: 'Pechhulp' };
      return res.status(403).json({
        error: `Geen toegang. Je mist de Discord-rol voor ${namen[requestedDienst] || requestedDienst}.`,
      });
    }

    return res.status(200).json({ ...authPayload, isBeheer: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Serverfout bij Discord check' });
  }
};
