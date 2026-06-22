const express = require('express');
const { config } = require('../config.js');
const { requireAuth } = require('../middleware/auth.js');
const { getGithubOAuthConfig } = require('../services/github.js');
const { updateGithubOAuthSettings } = require('../services/settings.js');
const { toPublicUser, updateProfile } = require('../services/users.js');

const router = express.Router();

function buildPublicGithubSettings() {
  const oauthConfig = getGithubOAuthConfig();

  return {
    configured: Boolean(oauthConfig.clientId && oauthConfig.clientSecret),
    clientId: oauthConfig.clientId,
    callbackUrl: oauthConfig.callbackUrl,
    defaultCallbackUrl: `${config.frontendUrl}/api/auth/github/callback`,
    createUrl: 'https://github.com/settings/applications/new',
    requiredScopes: 'read:user user:email'
  };
}

router.patch('/profile', requireAuth, (req, res) => {
  try {
    const user = updateProfile(req.user.id, req.body);
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    const status = error.message === 'current_password_invalid' ? 401 : 400;
    return res.status(status).json({ error: error.message || 'profile_update_failed' });
  }
});

router.get('/github-oauth', requireAuth, (req, res) => {
  return res.json(buildPublicGithubSettings());
});

router.put('/github-oauth', requireAuth, (req, res) => {
  if (req.user.must_change_credentials) {
    return res.status(403).json({ error: 'change_credentials_required' });
  }

  try {
    updateGithubOAuthSettings(req.body);
    return res.json(buildPublicGithubSettings());
  } catch (error) {
    return res.status(400).json({ error: error.message || 'github_oauth_update_failed' });
  }
});

module.exports = router;
