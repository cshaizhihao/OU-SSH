const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config.js');
const { initializeDatabase } = require('./db.js');
const authRoutes = require('./routes/auth.js');
const keysRoutes = require('./routes/keys.js');
const securityRoutes = require('./routes/security.js');

initializeDatabase();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: config.corsOrigin.split(',').map((origin) => origin.trim()),
  credentials: false,
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ou-ssh-api'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/security', securityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: error.message || 'internal_server_error'
  });
});

app.listen(config.port, () => {
  console.log(`OU-SSH API listening on :${config.port}`);
});
