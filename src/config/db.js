const mongoose = require('mongoose');

// Never log credentials: mask the user:password part of the connection string.
const maskUri = (uri) => String(uri).replace(/\/\/([^:@/]+):([^@]+)@/, '//$1:****@');

// Reuse a single connection across invocations. On serverless platforms a new
// connection per request would exhaust the file descriptor limit.
const cached = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    cached.promise = mongoose
      .connect(uri)
      .then((instance) => {
        console.log(`MongoDB terhubung: ${maskUri(uri)}`);
        return instance;
      })
      .catch((err) => {
        // Allow the next request to retry instead of caching a failed attempt.
        cached.promise = null;
        console.error('Gagal terhubung ke MongoDB:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
