const roomModel = require('../models/roomModel');

const listRooms = async (req, res, next) => {
  try {
    const { roomType, minCapacity, startTime, endTime } = req.query;

    if (startTime && endTime) {
      const rooms = await roomModel.findAvailable({
        startTime,
        endTime,
        minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
        roomType,
      });
      return res.json({ rooms });
    }

    const rooms = await roomModel.list({
      roomType,
      minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
    });
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const room = await roomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (err) {
    next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, roomType, capacity, description, status } = req.body;
    const room = await roomModel.create({
      name,
      roomType,
      capacity: parseInt(capacity, 10),
      description,
      status,
    });
    res.status(201).json({ room });
  } catch (err) {
    next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { name, roomType, capacity, description, status } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (roomType !== undefined) fields.room_type = roomType;
    if (capacity !== undefined) fields.capacity = parseInt(capacity, 10);
    if (description !== undefined) fields.description = description;
    if (status !== undefined) fields.status = status;
    const room = await roomModel.update(req.params.id, fields);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (err) {
    next(err);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    await roomModel.remove(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom };
