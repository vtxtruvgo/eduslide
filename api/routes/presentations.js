const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');
const { checkSession, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', checkSession, authorize(['student']), upload.single('presentation'), presentationController.upload);
router.get('/', checkSession, presentationController.getAll);
router.get('/:id', checkSession, presentationController.getById);
router.patch('/:id/status', checkSession, authorize(['admin', 'faculty']), presentationController.updateStatus);

module.exports = router;
