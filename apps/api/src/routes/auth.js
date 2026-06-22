const express = require('express');
const { config } = require('../config.js');
const { requireAuth } = require('../middleware/auth.js');
const {
  findUserByGithubId,
  findUserById,
  findUserByUsername,
  linkGithub,
  toPublicUser,
  verifyPassword
} = require('../services/users.js');
const { issueAccessToken } = require('../services/tokens.js');
const {
  buildGithubAuthorizeUrl,
  exchangeGithubCode,
  isGithubOAuthConfigured,
  verifyOAuthState
} = require('../services/github.js');

const router = express.Router();

function frontendRedirect(path, params = {}) {
  const url = new URL(path, config.frontendUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

router.post('/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'credentials_required' });
  }

  const user = findUserByUsername(username);

  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  return res.json({
    token: issueAccessToken(user),
    user: toPublicUser(user)
  });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: toPublicUser(req.user) });
});

router.get('/github', (req, res) => {
  if (!isGithubOAuthConfigured()) {
    return res.redirect(frontendRedirect('/login', { error: 'github_oauth_not_configured' }));
  }

  return res.redirect(buildGithubAuthorizeUrl('login'));
});

router.post('/github/link', requireAuth, (req, res) => {
  if (!isGithubOAuthConfigured()) {
    return res.status(503).json({ error: 'github_oauth_not_configured' });
  }

  return res.json({
    url: buildGithubAuthorizeUrl('link', req.user.id)
  });
});

router.get('/github/callback', async (req, res) => {
  const code = String(req.query.code || '');
  const state = String(req.query.state || '');

  if (!code || !state) {
    return res.redirect(frontendRedirect('/login', { error: 'github_oauth_invalid_callback' }));
  }

  try {
    const statePayload = verifyOAuthState(state);
    const githubUser = await exchangeGithubCode(code);

    if (statePayload.mode === 'link') {
      const user = findUserById(Number(statePayload.userId));

      if (!user) {
        return res.redirect(frontendRedirect('/login', { error: 'user_not_found' }));
      }

      const linkedUser = linkGithub(user.id, githubUser);
      return res.redirect(frontendRedirect('/dashboard', {
        token: issueAccessToken(linkedUser),
        oauth: 'linked'
      }));
    }

    const user = findUserByGithubId(githubUser.id);

    if (!user) {
      return res.redirect(frontendRedirect('/login', { error: 'github_account_not_linked' }));
    }

    return res.redirect(frontendRedirect('/dashboard', {
      token: issueAccessToken(user),
      oauth: 'login'
    }));
  } catch (error) {
    return res.redirect(frontendRedirect('/login', { error: error.message || 'github_oauth_failed' }));
  }
});

module.exports = router;
