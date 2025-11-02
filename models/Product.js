const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: {
    data: Buffer,       // opsiyonel
    contentType: String, // opsiyonel
  },
  barcode: {
    type: String,
    unique: true,   // benzersiz olmalı
    sparse: true,   // null veya undefined olursa unique index hatası çıkmaz
  },
});

// Gerekirse manuel index oluşturma (Mongoose otomatik de oluşturur)
ProductSchema.index({ barcode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Product', ProductSchema);
