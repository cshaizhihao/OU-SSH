const { verifyAccessToken } = require('../services/tokens.js');
const { findUserById } = require('../services/users.js');

function requireAuth(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const [, token] = authorization.match(/^Bearer\s+(.+)$/i) || [];

  if (!token) {
    return res.status(401).json({ error: 'missing_token' });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = findUserById(Number(payload.sub));

    if (!user) {
      return res.status(401).json({ error: 'user_not_found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { requireAuth };
