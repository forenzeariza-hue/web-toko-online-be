const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { signToken } = require('../utils/token');

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const toPublicUser = (user) => ({
  _id: user._id,
  nama: user.nama,
  email: user.email,
});

const register = async (req, res, next) => {
  try {
    const { nama, email, password } = req.body;

    const error = [];
    if (!nama) error.push('Nama wajib diisi');
    if (!email) error.push('Email wajib diisi');
    else if (!EMAIL_PATTERN.test(String(email))) error.push('Format email tidak valid');
    if (!password) error.push('Password wajib diisi');
    else if (String(password).length < 6) error.push('Password minimal 6 karakter');

    if (error.length > 0) {
      return res.status(400).json({ message: 'Data registrasi tidak valid', error });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      nama,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      data: { ...toPublicUser(user), token: signToken(user._id) },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select('+password');

    const invalidCredentials = () =>
      res.status(401).json({ message: 'Email atau password salah' });

    if (!user) {
      return invalidCredentials();
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return invalidCredentials();
    }

    return res.status(200).json({
      data: { ...toPublicUser(user), token: signToken(user._id) },
    });
  } catch (err) {
    return next(err);
  }
};

const me = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};

module.exports = { register, login, me };
