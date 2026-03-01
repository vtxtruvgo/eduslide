const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkSession, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(checkSession);
router.use(authorize(['admin']));

router.get('/settings', adminController.getSystemSettings);
router.post('/settings', adminController.saveSystemSettings);
router.post('/test-sql', adminController.testSQLConnection);

module.exports = router;
