const express = require('express');
const { requireAuth } = require('../middleware/auth.js');
const { toPublicUser, updateProfile } = require('../services/users.js');

const router = express.Router();

router.patch('/profile', requireAuth, (req, res) => {
  try {
    const user = updateProfile(req.user.id, req.body);
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    const status = error.message === 'current_password_invalid'
      ? 401
      : error.message === 'new_username_required'
        ? 422
        : 400;
    return res.status(status).json({ error: error.message || 'profile_update_failed' });
  }
});

module.exports = router;
