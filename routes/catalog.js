const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Catalog = require('../models/Catalog');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// POST: yeni katalog oluştur
router.post('/', auth(), async (req, res) => {
  try {
    const { productIds } = req.body; // seçilen ürünlerin ID'leri

    const catalog = new Catalog({
      owner: req.user.id,
      products: productIds,
      uuid: uuidv4()
    });

    await catalog.save();
    res.status(201).json({ uuid: catalog.uuid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Katalog oluşturulamadı' });
  }
});

// GET: katalogu görüntüleme
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const catalog = await Catalog.findOne({ uuid }).populate('products');

    if (!catalog) return res.status(404).json({ error: 'Katalog bulunamadı' });

    // products alanını frontend için formatlayabiliriz
    const formattedProducts = catalog.products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      barcode: p.barcode || '',
      image: p.image?.data ? `data:${p.image.contentType};base64,${p.image.data.toString('base64')}` : ''
    }));

    res.status(200).json({ products: formattedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Katalog alınamadı' });
  }
});

module.exports = router;
