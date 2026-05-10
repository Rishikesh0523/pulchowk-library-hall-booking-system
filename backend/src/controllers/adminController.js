const bookingModel = require('../models/bookingModel');

const getStats = async (req, res, next) => {
  try {
    const data = await bookingModel.stats();
    res.json({ stats: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
