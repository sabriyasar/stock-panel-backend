const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = (role) => async (req, res, next) => {
  try {
    // Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization']
    if (!authHeader) return res.status(401).json({ error: 'Token gerekli' })

    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token eksik' })

    // Token doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded?.id) return res.status(401).json({ error: 'Token geçersiz' })

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    // Rol kontrolü (isteğe bağlı)
    if (role && user.role !== role)
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' })

    // req.user’a kullanıcı bilgilerini ekle
    req.user = { id: user._id, role: user.role }
    next()
  } catch (err) {
    console.error('Auth middleware hatası:', err.message)
    return res.status(401).json({ error: 'Token geçersiz' })
  }
}
