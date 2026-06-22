const { URLSearchParams } = require('node:url');
const { config } = require('../config.js');
const { getGithubOAuthSettings } = require('./settings.js');
const { issueOAuthState, verifyOAuthState } = require('./tokens.js');

function getGithubOAuthConfig() {
  return getGithubOAuthSettings({
    clientId: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackUrl: config.githubCallbackUrl
  });
}

function isGithubOAuthConfigured() {
  const oauthConfig = getGithubOAuthConfig();
  return Boolean(oauthConfig.clientId && oauthConfig.clientSecret);
}

function buildGithubAuthorizeUrl(mode, userId) {
  const state = issueOAuthState({ mode, userId });
  const oauthConfig = getGithubOAuthConfig();
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.callbackUrl,
    scope: 'read:user user:email',
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeGithubCode(code) {
  const oauthConfig = getGithubOAuthConfig();
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      code,
      redirect_uri: oauthConfig.callbackUrl
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
  getGithubOAuthConfig,
  isGithubOAuthConfigured,
  verifyOAuthState
};
