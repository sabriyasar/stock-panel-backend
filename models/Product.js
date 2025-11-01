const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  barcode: { type: String }, // opsiyonel
});

module.exports = mongoose.model('Product', ProductSchema);
