const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/bookingController');

router.post(
  '/',
  authenticate,
  [
    body('roomId').isInt({ min: 1 }),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
  ],
  validate,
  ctrl.createBooking
);

router.get('/me', authenticate, ctrl.myBookings);
router.get('/calendar', authenticate, ctrl.calendar);
router.post('/:id/cancel', authenticate, ctrl.cancelBooking);

router.get('/', authenticate, requireAdmin, ctrl.listAll);
router.put('/:id/status', authenticate, requireAdmin, ctrl.setStatus);

module.exports = router;
