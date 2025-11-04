const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET: sadece giriş yapan kullanıcının ürünleri
router.get('/', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Product.find({ owner: userId });
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

// GET: Tek bir ürün getir (sadece owner erişebilir)
router.get('/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ürün ID' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    // sadece kendi ürününü görebilsin
    if (product.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Bu ürünü görüntüleme yetkiniz yok' });
    }

    const formatted = {
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode || '',
      image: product.image?.data
        ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
        : '',
    };

    res.status(200).json(formatted);
  } catch (err) {
    console.error('GET /:id hatası:', err);
    res.status(500).json({ error: 'Ürün alınamadı' });
  }
});

// POST: yeni ürün ekle (owner atanacak)
router.post('/', auth(), upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock, barcode } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      owner: req.user.id, // kullanıcıyı ata
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

// PUT ve DELETE işlemlerinde de auth ekleyip, sadece owner kontrolü yapılabilir
router.put('/:id', auth(), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    // sadece owner güncelleyebilir
    if (product.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Bu ürünü güncelleme yetkiniz yok' });
    }

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

router.delete('/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ürün ID' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    // sadece owner silebilir
    if (product.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Bu ürünü silme yetkiniz yok' });
    }

    await product.remove();
    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

module.exports = router;
