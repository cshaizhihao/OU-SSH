const bcrypt = require('bcryptjs');
const { getDb } = require('../db.js');

function toPublicUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    mustChangeCredentials: Boolean(row.must_change_credentials),
    githubLogin: row.github_login || '',
    githubLinked: Boolean(row.github_id)
  };
}

function findUserById(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function findUserByUsername(username) {
  return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function findUserByGithubId(githubId) {
  return getDb().prepare('SELECT * FROM users WHERE github_id = ?').get(String(githubId));
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

function updateProfile(userId, payload) {
  const current = findUserById(userId);
  if (!current) {
    throw new Error('user_not_found');
  }

  const nextUsername = String(payload.username || '').trim();
  const currentPassword = String(payload.currentPassword || '');
  const nextPassword = String(payload.newPassword || '');

  if (!nextUsername) {
    throw new Error('username_required');
  }

  if (!currentPassword || !verifyPassword(current, currentPassword)) {
    throw new Error('current_password_invalid');
  }

  if (nextUsername !== current.username) {
    const duplicated = findUserByUsername(nextUsername);
    if (duplicated && duplicated.id !== current.id) {
      throw new Error('username_exists');
    }
  }

  if (current.must_change_credentials && nextUsername === current.username) {
    throw new Error('new_username_required');
  }

  if (current.must_change_credentials && !nextPassword) {
    throw new Error('new_password_required');
  }

  if (nextPassword && nextPassword.length < 6) {
    throw new Error('password_too_short');
  }

  const passwordHash = nextPassword
    ? bcrypt.hashSync(nextPassword, 12)
    : current.password_hash;

  getDb().prepare(`
    UPDATE users
    SET username = ?,
        password_hash = ?,
        must_change_credentials = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(nextUsername, passwordHash, userId);

  return findUserById(userId);
}

function linkGithub(userId, githubUser) {
  getDb().prepare(`
    UPDATE users
    SET github_id = ?,
        github_login = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(String(githubUser.id), githubUser.login, userId);

  return findUserById(userId);
}

module.exports = {
  findUserById,
  findUserByUsername,
  findUserByGithubId,
  linkGithub,
  toPublicUser,
  updateProfile,
  verifyPassword
};
