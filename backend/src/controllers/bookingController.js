const bookingModel = require('../models/bookingModel');
const roomModel = require('../models/roomModel');
const { bookingsCounter } = require('../config/metrics');

const createBooking = async (req, res, next) => {
  try {
    const { roomId, startTime, endTime, purpose } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot book in the past' });
    }
    if (end <= start) {
      return res
        .status(400)
        .json({ message: 'End time must be after start time' });
    }

    const room = await roomModel.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status !== 'available') {
      return res
        .status(400)
        .json({ message: 'Room is not available for booking' });
    }

    const overlap = await bookingModel.hasOverlap(roomId, startTime, endTime);
    if (overlap) {
      return res
        .status(409)
        .json({ message: 'Room already booked for the selected time' });
    }

    const booking = await bookingModel.create({
      userId: req.user.id,
      roomId,
      startTime,
      endTime,
      purpose,
    });
    bookingsCounter.inc();
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

const myBookings = async (req, res, next) => {
  try {
    const bookings = await bookingModel.listByUser(req.user.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled' });
    }
    const updated = await bookingModel.updateStatus(req.params.id, 'cancelled');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
};

const listAll = async (req, res, next) => {
  try {
    const bookings = await bookingModel.listAll();
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const calendar = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: 'start and end query params are required (ISO date strings)' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const bookings = await bookingModel.listInRange(
      startDate.toISOString(),
      endDate.toISOString()
    );
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const setStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'cancelled', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await bookingModel.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  myBookings,
  cancelBooking,
  listAll,
  calendar,
  setStatus,
};
