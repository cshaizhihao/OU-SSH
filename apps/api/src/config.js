const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

function readEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const dataDir = readEnv('DATA_DIR', path.resolve(process.cwd(), 'data'));

const config = {
  port: Number(readEnv('PORT', '3000')),
  dataDir,
  databasePath: readEnv('DATABASE_PATH', path.join(dataDir, 'ou-ssh.sqlite')),
  jwtSecret: readEnv('JWT_SECRET', 'ou-ssh-dev-insecure-secret-change-me'),
  jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
  frontendUrl: readEnv('FRONTEND_URL', 'http://localhost:5173').replace(/\/$/, ''),
  corsOrigin: readEnv('CORS_ORIGIN', readEnv('FRONTEND_URL', 'http://localhost:5173')),
  defaultAdminUsername: readEnv('DEFAULT_ADMIN_USERNAME', 'admin'),
  defaultAdminPassword: readEnv('DEFAULT_ADMIN_PASSWORD', 'admin'),
  githubClientId: readEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: readEnv('GITHUB_CLIENT_SECRET'),
  githubCallbackUrl: readEnv('GITHUB_CALLBACK_URL', 'http://localhost:3000/api/auth/github/callback')
};

module.exports = { config };
