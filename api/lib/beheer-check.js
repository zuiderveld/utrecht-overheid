const rolesFile = require('../discord-roles');

function getRoleId(envName, fileKey) {
  const fromEnv = process.env[envName];
  if (fromEnv) return fromEnv;
  return rolesFile[fileKey] || null;
}

module.exports = async function checkIsBeheer(accessToken) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const beheerRoleId = getRoleId('DISCORD_ROLE_BEHEER', 'beheer');

  if (!token || !guildId || !beheerRoleId || !accessToken) {
    return { ok: false, error: 'Server niet geconfigureerd voor beheer-check' };
  }

  const userRes = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) return { ok: false, error: 'Discord token ongeldig' };
  const user = await userRes.json();

  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
    { headers: { Authorization: `Bot ${token}` } }
  );
  if (!memberRes.ok) return { ok: false, error: 'Geen serverlid' };

  const member = await memberRes.json();
  const isBeheer = (member.roles || []).includes(beheerRoleId);
  if (!isBeheer) return { ok: false, error: 'Geen beheer-rechten' };

  return { ok: true, username: member.nick || user.global_name || user.username };
};
