const jwt = require('jsonwebtoken');

const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res
        .status(401)
        .json({ message: 'Akses ditolak, token tidak ditemukan' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { protect };
