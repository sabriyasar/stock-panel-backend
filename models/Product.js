const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: {
      data: Buffer,        // opsiyonel
      contentType: String, // opsiyonel
    },
    barcode: {
      type: String,
      unique: true,   // benzersiz olmalı
      sparse: true,   // null veya undefined olursa unique index hatası çıkmaz
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',    // User modeline referans
      required: true, // her ürün bir kullanıcıya ait olmalı
    },
  },
  { timestamps: true } // createdAt ve updatedAt otomatik
);

// Barcode için index
ProductSchema.index({ barcode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Product', ProductSchema);
