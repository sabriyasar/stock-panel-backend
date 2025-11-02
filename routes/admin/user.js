const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const bcrypt = require('bcrypt')
const auth = require('../../middleware/auth')

// GET: Tüm kullanıcıları getir
router.get('/', auth('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.status(200).json(users)
  } catch (err) {
    console.error('Kullanıcılar alınamadı:', err)
    res.status(500).json({ error: 'Kullanıcılar alınamadı' })
  }
})

// POST: Yeni kullanıcı ekle
router.post('/', auth('admin'), async (req, res) => {
  const { firstName, lastName, company, email, password, role, package } = req.body
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ error: 'Gerekli alanlar eksik' })
  }

  try {
    // Case-insensitive email kontrolü
    const existing = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
    if (existing) {
      console.log('Email zaten kayıtlı:', email)
      return res.status(400).json({ error: 'Bu email zaten kayıtlı' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      firstName,
      lastName,
      company,
      email,
      password: hashedPassword,
      role,
      package
    })

    await user.save()
    console.log('Yeni kullanıcı oluşturuldu:', email)

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      package: user.package,
      company: user.company
    })
  } catch (err) {
    console.error('Kullanıcı eklenemedi:', err)
    res.status(500).json({ error: 'Kullanıcı eklenemedi' })
  }
})

// PUT: Kullanıcı güncelle
router.put('/:id', auth('admin'), async (req, res) => {
  const { id } = req.params
  const { firstName, lastName, company, email, password, role, package } = req.body

  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (company) user.company = company
    if (email) user.email = email
    if (role) user.role = role
    if (package) user.package = package
    if (password) user.password = await bcrypt.hash(password, 10)

    await user.save()
    console.log('Kullanıcı güncellendi:', email || user.email)

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      package: user.package,
      company: user.company
    })
  } catch (err) {
    console.error('Kullanıcı güncellenemedi:', err)
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' })
  }
})

// DELETE: Kullanıcı sil
router.delete('/:id', auth('admin'), async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })

    console.log('Kullanıcı silindi:', user.email)
    res.status(200).json({ message: 'Kullanıcı silindi' })
  } catch (err) {
    console.error('Kullanıcı silinemedi:', err)
    res.status(500).json({ error: 'Kullanıcı silinemedi' })
  }
})

module.exports = router
