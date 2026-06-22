const express = require('express');
const archiver = require('archiver');
const { requireAuth } = require('../middleware/auth.js');
const { generateEd25519OpenSshKeyPair, sanitizeComment } = require('../utils/sshKey.js');

const router = express.Router();

router.get('/generate', requireAuth, (req, res, next) => {
  const alias = sanitizeComment(req.query.alias || 'ou-ssh-generated-key');
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  let keyPair = generateEd25519OpenSshKeyPair(alias);
  let privateKey = keyPair.privateKey;
  let publicKey = keyPair.publicKey;
  keyPair = null;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${alias}-ed25519.zip"`);
  res.setHeader('Cache-Control', 'no-store');

  archive.on('error', next);
  archive.on('end', () => {
    privateKey.fill(0);
    publicKey.fill(0);
    privateKey = null;
    publicKey = null;
  });

  archive.pipe(res);
  archive.append(privateKey, { name: 'id_ed25519', mode: 0o600 });
  archive.append(publicKey, { name: 'id_ed25519.pub', mode: 0o644 });
  archive.finalize();
});

module.exports = router;
