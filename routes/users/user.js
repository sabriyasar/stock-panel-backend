const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const authMiddleware = require('../../middleware/auth') // token doğrulama middleware'i

// GET: /users/profile
router.get('/profile', authMiddleware('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Profil alınamadı' })
  }
})

module.exports = router
