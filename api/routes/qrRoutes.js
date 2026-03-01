const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { checkSession, authorize } = require('../middleware/auth');

router.get('/generate', qrController.generateSession);
router.get('/status/:uuid', qrController.checkStatus);

// Only an authenticated faculty member on their phone can approve the session
router.post('/approve', checkSession, authorize(['faculty', 'admin']), qrController.approveSession);

module.exports = router;
