const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const router = express.Router();

// 🚨 Render persistent disk mount path
// Render dashboard’dan eklediğin disk yolunu kullan
const uploadDir = '/opt/render/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer ayarı
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// GET: tüm ürünler
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
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
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün alınamadı' });
  }
});

// POST: yeni ürün ekle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      return res.status(400).json({ error: 'Price veya stock geçerli değil' });
    }

    const image = req.file ? req.file.filename : '';
    const product = new Product({ name, price: priceNum, stock: stockNum, image });

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
    const { name, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock) product.stock = parseInt(stock, 10);

    if (req.file) {
      // eski görseli sil
      if (product.image) {
        const oldImagePath = path.join(uploadDir, product.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = req.file.filename;
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

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    // Görseli sil
    if (product.image) {
      try {
        const imagePath = path.join(uploadDir, product.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      } catch (fileErr) {
        console.warn('Görsel silinirken hata oluştu:', fileErr.message);
      }
    }

    // Veritabanından sil
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

module.exports = router;

/* const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const router = express.Router();

// uploads klasörü varsa yoksa oluştur
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer ayarı
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// GET: tüm ürünler
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
});

// POST: yeni ürün ekle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      return res.status(400).json({ error: 'Price veya stock geçerli değil' });
    }

    const image = req.file ? req.file.filename : '';
    const product = new Product({ name, price: priceNum, stock: stockNum, image });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün eklenemedi' });
  }
});

module.exports = router; */