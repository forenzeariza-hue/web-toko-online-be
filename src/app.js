const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Behind a proxy on Vercel, so rate limiting reads the real client IP.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Toko Online berjalan' });
});

// Kept free of database access so it answers fast, even on a cold start.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serverless has no startup phase, so the connection is ensured per request.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
