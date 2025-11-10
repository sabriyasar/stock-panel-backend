const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Catalog = require('../models/Catalog');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST: yeni katalog oluştur
router.post('/', auth(), async (req, res) => {
  try {
    const { productIds } = req.body; // seçilen ürünlerin ID'leri

    // Product ID'lerini DB'de kontrol et
    const validProducts = await Product.find({ _id: { $in: productIds } });
    if (validProducts.length === 0) {
      return res.status(400).json({ error: 'Geçerli ürün bulunamadı' });
    }

    const catalog = new Catalog({
      owner: req.user.id,       // artık gerçek user ID
      products: validProducts.map(p => p._id),
      uuid: uuidv4()
    });

    await catalog.save();
    res.status(201).json({ uuid: catalog.uuid });
  } catch (err) {
    console.error('Katalog POST hatası:', err);
    res.status(500).json({ error: 'Katalog oluşturulamadı' });
  }
});

// GET: Kullanıcının kendi oluşturduğu kataloglar
router.get('/my-catalogs', auth(), async (req, res) => {
  try {
    const catalogs = await Catalog.find({ owner: req.user.id }).sort({ createdAt: -1 });

    const formattedCatalogs = catalogs.map(c => ({
      uuid: c.uuid,
      createdAt: c.createdAt
    }));

    res.status(200).json({ catalogs: formattedCatalogs });
  } catch (err) {
    console.error('Kullanıcı katalogları GET hatası:', err);
    res.status(500).json({ error: 'Kataloglar alınamadı' });
  }
});

// GET: katalogu görüntüleme
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const catalog = await Catalog.findOne({ uuid }).populate('products');

    if (!catalog) return res.status(404).json({ error: 'Katalog bulunamadı' });

    const formattedProducts = catalog.products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      barcode: p.barcode || '',
      image: p.image?.data
        ? `data:${p.image.contentType};base64,${p.image.data.toString('base64')}`
        : ''
    }));

    res.status(200).json({ products: formattedProducts });
  } catch (err) {
    console.error('Katalog GET hatası:', err);
    res.status(500).json({ error: 'Katalog alınamadı' });
  }
});

// DELETE: katalog silme
router.delete('/:uuid', auth(), async (req, res) => {
  try {
    const { uuid } = req.params;
    const catalog = await Catalog.findOne({ uuid });

    if (!catalog) return res.status(404).json({ error: 'Katalog bulunamadı' });
    if (catalog.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Bu katalogu silmeye yetkiniz yok' });

    await catalog.deleteOne();
    res.status(200).json({ message: 'Katalog silindi' });
  } catch (err) {
    console.error('Katalog DELETE hatası:', err);
    res.status(500).json({ error: 'Katalog silinemedi' });
  }
});

module.exports = router;
