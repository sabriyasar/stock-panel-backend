const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: {
    data: { type: Buffer },       // opsiyonel
    contentType: { type: String },// opsiyonel
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true, // null veya undefined olursa unique index hatası çıkmaz
  },
});

module.exports = mongoose.model('Product', ProductSchema);
