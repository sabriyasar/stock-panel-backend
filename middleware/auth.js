const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = (role) => async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production'

    // Local ortamda sahte user atayalım
    if (!isProd) {
      req.user = { id: new mongoose.Types.ObjectId(), role: role || 'admin' }
      console.log('🌟 Local test user:', req.user)
      return next()
    }

    // Prod ortamda JWT doğrulaması
    const authHeader = req.headers['authorization']
    if (!authHeader) return res.status(401).json({ error: 'Token gerekli' })

    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token eksik' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded?.id) return res.status(401).json({ error: 'Token geçersiz' })

    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    if (role && user.role !== role)
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' })

    req.user = { id: user._id, role: user.role }

    // ---------------- Sliding Session ----------------
    // Token geçerli, yeni token oluştur ve header'a ekle
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // token süresi tekrar 15 dk
    )
    res.setHeader('Authorization', `Bearer ${newToken}`)
    // --------------------------------------------------

    console.log('✅ Doğrulanan kullanıcı:', req.user)
    next()
  } catch (err) {
    console.error('Auth middleware hatası:', err.message)
    return res.status(401).json({ error: 'Token geçersiz veya süresi dolmuş' })
  }
}
