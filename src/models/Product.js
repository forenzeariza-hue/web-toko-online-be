const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
    },
    deskripsi: {
      type: String,
      required: [true, 'Deskripsi produk wajib diisi'],
      trim: true,
    },
    harga: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    stok: {
      type: Number,
      required: [true, 'Stok produk wajib diisi'],
      min: [0, 'Stok tidak boleh negatif'],
    },
    gambar: {
      type: String,
      default: '',
    },
    kategori: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Product', productSchema);
