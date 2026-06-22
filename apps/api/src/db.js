const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const { config } = require('./config.js');

let database;

function getDb() {
  if (!database) {
    fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
    database = new DatabaseSync(config.databasePath);
  }

  return database;
}

function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      must_change_credentials INTEGER NOT NULL DEFAULT 1,
      github_id TEXT,
      github_login TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existing = db.prepare('SELECT id FROM users WHERE id = 1').get();

  if (!existing) {
    const passwordHash = bcrypt.hashSync(config.defaultAdminPassword, 12);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, must_change_credentials)
      VALUES (1, ?, ?, 1)
    `).run(config.defaultAdminUsername, passwordHash);
  }
}

module.exports = {
  getDb,
  initializeDatabase
};
