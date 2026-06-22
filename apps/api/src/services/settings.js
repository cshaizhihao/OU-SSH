const { getDb } = require('../db.js');

function getSetting(key, fallback = '') {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  getDb().prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
}

function getGithubOAuthSettings(fallbacks) {
  return {
    clientId: getSetting('github_client_id', fallbacks.clientId),
    clientSecret: getSetting('github_client_secret', fallbacks.clientSecret),
    callbackUrl: getSetting('github_callback_url', fallbacks.callbackUrl)
  };
}

function updateGithubOAuthSettings(payload) {
  const clientId = String(payload.clientId || '').trim();
  const clientSecret = String(payload.clientSecret || '').trim();
  const callbackUrl = String(payload.callbackUrl || '').trim();

  if (!clientId) {
    throw new Error('github_client_id_required');
  }

  if (!clientSecret) {
    throw new Error('github_client_secret_required');
  }

  if (!callbackUrl) {
    throw new Error('github_callback_url_required');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(callbackUrl);
  } catch (error) {
    throw new Error('github_callback_url_invalid');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('github_callback_url_invalid');
  }

  setSetting('github_client_id', clientId);
  setSetting('github_client_secret', clientSecret);
  setSetting('github_callback_url', callbackUrl);

  return getGithubOAuthSettings({
    clientId: '',
    clientSecret: '',
    callbackUrl: ''
  });
}

module.exports = {
  getGithubOAuthSettings,
  updateGithubOAuthSettings
};
