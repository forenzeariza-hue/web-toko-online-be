const mongoose = require('mongoose');

// Never log credentials: mask the user:password part of the connection string.
const maskUri = (uri) => String(uri).replace(/\/\/([^:@/]+):([^@]+)@/, '//$1:****@');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB terhubung: ${maskUri(uri)}`);
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
