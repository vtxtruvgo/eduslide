const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkSession } = require('../middleware/auth');

router.post('/sync', checkSession, authController.syncUser);
router.get('/me', checkSession, authController.getMe);

module.exports = router;
