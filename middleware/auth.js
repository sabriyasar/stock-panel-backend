const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = (role) => async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token gerekli' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    if (role && user.role !== role)
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' })

    req.user = { id: user._id, role: user.role }
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Token geçersiz' })
  }
}
