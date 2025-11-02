const express = require('express')
const Product = require('../../models/Product') // ürün modelin

const router = express.Router()

// GET: kullanıcı paneli için ürün istatistikleri
router.get('/products', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const inStock = await Product.countDocuments({ stock: { $gt: 0 } })
    const outOfStock = await Product.countDocuments({ stock: 0 })

    res.status(200).json({
      totalProducts,
      inStock,
      outOfStock,
    })
  } catch (err) {
    console.error('Ürün istatistikleri alınamadı:', err)
    res.status(500).json({ error: 'Ürün istatistikleri alınamadı' })
  }
})

module.exports = router
