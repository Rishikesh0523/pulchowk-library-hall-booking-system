const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/roomController');

router.get('/', ctrl.listRooms);
router.get('/:id', ctrl.getRoom);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').isString().isLength({ min: 1 }),
    body('roomType').isString().isLength({ min: 1 }),
    body('capacity').isInt({ min: 1 }),
  ],
  validate,
  ctrl.createRoom
);

router.put('/:id', authenticate, requireAdmin, ctrl.updateRoom);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteRoom);

module.exports = router;
