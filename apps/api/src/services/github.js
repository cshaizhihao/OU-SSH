const { URLSearchParams } = require('node:url');
const { config } = require('../config.js');
const { issueOAuthState, verifyOAuthState } = require('./tokens.js');

function isGithubOAuthConfigured() {
  return Boolean(config.githubClientId && config.githubClientSecret);
}

function buildGithubAuthorizeUrl(mode, userId) {
  const state = issueOAuthState({ mode, userId });
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user user:email',
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeGithubCode(code) {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: config.githubCallbackUrl
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error || 'github_token_exchange_failed');
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'OU-SSH'
    }
  });

  const userData = await userResponse.json();

  if (!userResponse.ok || !userData.id || !userData.login) {
    throw new Error('github_user_fetch_failed');
  }

  return userData;
}

module.exports = {
  buildGithubAuthorizeUrl,
  exchangeGithubCode,
  isGithubOAuthConfigured,
  verifyOAuthState
};
