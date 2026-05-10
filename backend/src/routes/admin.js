const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.get('/stats', authenticate, requireAdmin, ctrl.getStats);

module.exports = router;
