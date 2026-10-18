require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Product = require('../models/Product');

const products = [
  {
    nama: 'Kemeja Flanel Pria',
    deskripsi: 'Kemeja flanel lengan panjang berbahan katun, cocok untuk casual.',
    harga: 175000,
    stok: 25,
    gambar: 'https://picsum.photos/seed/kemeja/400/300',
    kategori: 'Fashion Pria',
  },
  {
    nama: 'Sepatu Sneakers Putih',
    deskripsi: 'Sepatu sneakers unisex dengan sol karet, nyaman dipakai harian.',
    harga: 320000,
    stok: 12,
    gambar: 'https://picsum.photos/seed/sneakers/400/300',
    kategori: 'Sepatu',
  },
  {
    nama: 'Tas Ransel Laptop',
    deskripsi: 'Ransel dengan kompartemen laptop 14 inci dan bahan tahan air.',
    harga: 210000,
    stok: 18,
    gambar: 'https://picsum.photos/seed/ransel/400/300',
    kategori: 'Tas',
  },
  {
    nama: 'Headphone Bluetooth',
    deskripsi: 'Headphone wireless dengan noise cancelling dan baterai 20 jam.',
    harga: 450000,
    stok: 8,
    gambar: 'https://picsum.photos/seed/headphone/400/300',
    kategori: 'Elektronik',
  },
  {
    nama: 'Jam Tangan Digital',
    deskripsi: 'Jam tangan digital tahan air dengan fitur stopwatch dan alarm.',
    harga: 150000,
    stok: 30,
    gambar: 'https://picsum.photos/seed/jam/400/300',
    kategori: 'Aksesoris',
  },
  {
    nama: 'Botol Minum Stainless',
    deskripsi: 'Botol minum stainless steel 600ml, menjaga suhu minuman.',
    harga: 85000,
    stok: 40,
    gambar: 'https://picsum.photos/seed/botol/400/300',
    kategori: 'Peralatan',
  },
];

const seedProducts = async () => {
  const reset = process.argv.includes('--reset');

  try {
    await connectDB();

    if (reset) {
      await Product.deleteMany();
      const inserted = await Product.insertMany(products);
      console.log(
        `Seed reset produk selesai: ${inserted.length} produk dimasukkan`
      );
      return;
    }

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Data produk sudah ada, seed produk dilewati');
      return;
    }

    const inserted = await Product.insertMany(products);
    console.log(`Seed produk selesai: ${inserted.length} produk dimasukkan`);
  } catch (err) {
    console.error('Seed produk gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedProducts();
