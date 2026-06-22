const jwt = require('jsonwebtoken');
const { config } = require('../config.js');

function issueAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function issueOAuthState(payload) {
  return jwt.sign(
    {
      ...payload,
      kind: 'github-oauth-state'
    },
    config.jwtSecret,
    {
      expiresIn: '10m'
    }
  );
}

function verifyOAuthState(state) {
  const payload = jwt.verify(state, config.jwtSecret);

  if (payload.kind !== 'github-oauth-state') {
    throw new Error('invalid_oauth_state');
  }

  return payload;
}

module.exports = {
  issueAccessToken,
  issueOAuthState,
  verifyAccessToken,
  verifyOAuthState
};
