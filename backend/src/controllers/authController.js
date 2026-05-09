const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      passwordHash: hash,
      role: 'user',
    });
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
