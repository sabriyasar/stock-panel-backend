const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // 👈 token doğrulama middleware

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Tüm route’lara auth middleware ekliyoruz
router.use(auth()); // opsiyonel role verilebilir, örn: auth('admin')

// GET: kendi ürünlerini listele
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // token’dan gelen kullanıcı ID
    const products = await Product.find({ userId });

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

// GET: tek ürün (sadece kendi ürününü görebilir)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findOne({ _id: id, userId });
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
      userId: req.user.id, // 🔹 ürün sahibi kullanıcı ID
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

// PUT: ürün güncelle (sadece kendi ürünü)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;
    const userId = req.user.id;

    const product = await Product.findOne({ _id: id, userId });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı veya yetkiniz yok' });

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

// DELETE: ürün sil (sadece kendi ürünü)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findOneAndDelete({ _id: id, userId });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı veya yetkiniz yok' });

    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

module.exports = router;
