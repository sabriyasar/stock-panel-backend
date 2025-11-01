const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const jwt = require('jsonwebtoken')

// POST: /admin/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  console.log('Login attempt email:', email)

  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli' })
  }

  try {
    // Artık tüm kullanıcılar login olabilir
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: 'Şifre yanlış' })

    const token = jwt.sign(
      { id: user._id, role: user.role, package: user.package },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        package: user.package,
        company: user.company
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Giriş yapılamadı' })
  }
})

module.exports = router
