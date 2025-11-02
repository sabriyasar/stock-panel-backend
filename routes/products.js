const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET: tüm ürünler
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const formatted = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode || '',
      image: product.image?.data
        ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
        : ''
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
});

// GET: tek ürün
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.status(200).json({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode || '',
      image: product.image?.data
        ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
        : ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün alınamadı' });
  }
});

// POST: yeni ürün ekle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock, barcode } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    };

    if (barcode) productData.barcode = barcode;
    if (req.file) {
      productData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün eklenemedi' });
  }
});

// PUT: ürün güncelle
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock) product.stock = parseInt(stock, 10);
    if (barcode !== undefined) product.barcode = barcode;

    if (req.file) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün güncellenemedi' });
  }
});

// DELETE: ürün sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ürün ID' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

module.exports = router;
