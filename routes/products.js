const express = require('express')
const multer = require('multer')
const Product = require('../models/Product')

const router = express.Router()

// Multer ayarı (uploads klasörüne kaydedilecek)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
})
const upload = multer({ storage })

// GET: tüm ürünler
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ürünler alınamadı' })
  }
})

// POST: yeni ürün ekle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock } = req.body
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' })
    }

    const image = req.file ? req.file.filename : ''

    const product = new Product({ name, price, stock, image })
    await product.save()

    res.status(201).json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ürün eklenemedi' })
  }
})

module.exports = router
