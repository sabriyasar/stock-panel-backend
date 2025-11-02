const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String, required: true }, // pre-save hook ile oluşturulacak
  company: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  package: { type: String, default: 'basic' }
}, { timestamps: true })

// Şifre hashleme
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Name alanını oluştur
UserSchema.pre('save', function(next) {
  this.name = `${this.firstName} ${this.lastName}`.trim()
  next()
})

// Şifre kontrol fonksiyonu
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
