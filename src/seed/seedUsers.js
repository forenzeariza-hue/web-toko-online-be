require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');

// Demo account so the login page can be used immediately after seeding.
// Values can be overridden with SEED_USER_NAME / SEED_USER_EMAIL / SEED_USER_PASSWORD.
const demoUser = {
  nama: process.env.SEED_USER_NAME || 'Demo User',
  email: process.env.SEED_USER_EMAIL || 'demo@tokoonline.test',
  password: process.env.SEED_USER_PASSWORD || 'demo1234',
};

const createDemoUser = async () => {
  const hashedPassword = await bcrypt.hash(demoUser.password, 10);
  const user = await User.create({
    nama: demoUser.nama,
    email: demoUser.email,
    password: hashedPassword,
  });

  console.log(`Seed user selesai: ${user.email} / ${demoUser.password}`);
  return 1;
};

const seedUsers = async () => {
  const reset = process.argv.includes('--reset');

  try {
    await connectDB();

    if (reset) {
      await User.deleteMany();
      const inserted = await createDemoUser();
      console.log(`Seed reset user selesai: ${inserted} user dimasukkan`);
      return;
    }

    const existing = await User.findOne({ email: demoUser.email });
    if (existing) {
      console.log(`User demo sudah ada, seed user dilewati (${demoUser.email})`);
      return;
    }

    await createDemoUser();
  } catch (err) {
    console.error('Seed user gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();
