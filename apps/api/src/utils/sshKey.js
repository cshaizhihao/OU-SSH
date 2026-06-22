const { generateKeyPairSync, randomBytes } = require('node:crypto');

function decodeBase64Url(value) {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value, 0);
  return buffer;
}

function sshString(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return Buffer.concat([uint32(buffer.length), buffer]);
}

function wrapBase64(buffer) {
  return buffer.toString('base64').match(/.{1,70}/g).join('\n');
}

function encodeOpenSshPublicKey(publicKey, comment) {
  const blob = Buffer.concat([
    sshString('ssh-ed25519'),
    sshString(publicKey)
  ]);

  return Buffer.from(`ssh-ed25519 ${blob.toString('base64')} ${comment}\n`);
}

function encodeOpenSshPrivateKey(seed, publicKey, comment) {
  const check = randomBytes(4);
  const publicBlob = Buffer.concat([
    sshString('ssh-ed25519'),
    sshString(publicKey)
  ]);

  const privateFields = Buffer.concat([
    check,
    check,
    sshString('ssh-ed25519'),
    sshString(publicKey),
    sshString(Buffer.concat([seed, publicKey])),
    sshString(comment)
  ]);

  const padLength = (8 - (privateFields.length % 8)) % 8;
  const padding = Buffer.from(Array.from({ length: padLength }, (_, index) => index + 1));
  const privateBlock = Buffer.concat([privateFields, padding]);

  const raw = Buffer.concat([
    Buffer.from('openssh-key-v1\0'),
    sshString('none'),
    sshString('none'),
    sshString(Buffer.alloc(0)),
    uint32(1),
    sshString(publicBlob),
    sshString(privateBlock)
  ]);

  return Buffer.from(
    `-----BEGIN OPENSSH PRIVATE KEY-----\n${wrapBase64(raw)}\n-----END OPENSSH PRIVATE KEY-----\n`
  );
}

function sanitizeComment(input) {
  const value = String(input || '').trim();
  return value.replace(/[^a-zA-Z0-9_.@-]/g, '-').slice(0, 64) || 'ou-ssh-generated-key';
}

function generateEd25519OpenSshKeyPair(commentInput) {
  const { privateKey } = generateKeyPairSync('ed25519');
  const jwk = privateKey.export({ format: 'jwk' });
  const seed = decodeBase64Url(jwk.d);
  const publicKey = decodeBase64Url(jwk.x);
  const comment = sanitizeComment(commentInput);

  return {
    privateKey: encodeOpenSshPrivateKey(seed, publicKey, comment),
    publicKey: encodeOpenSshPublicKey(publicKey, comment)
  };
}

module.exports = {
  generateEd25519OpenSshKeyPair,
  sanitizeComment
};
