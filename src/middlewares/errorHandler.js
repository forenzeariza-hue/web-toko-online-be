const notFound = (req, res) => {
  res.status(404).json({ message: `Route tidak ditemukan: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const error = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ message: 'Data produk tidak valid', error });
  }

  if (err.name === 'CastError') {
    return res
      .status(400)
      .json({ message: 'Format data tidak valid', error: err.message });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
};

module.exports = { notFound, errorHandler };
