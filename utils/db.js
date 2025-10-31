const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  const dbName = process.env.MONGODB_DB

  console.log('Connecting to MongoDB...')
  console.log('URI:', '[' + uri + ']')
  console.log('DB Name:', dbName)

  if (!uri) throw new Error('MONGO_URI bulunamadı!')
  if (!dbName) throw new Error('MONGODB_DB bulunamadı!')

  try {
    await mongoose.connect(uri, { dbName })
    console.log('MongoDB connected successfully!')
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err)
    process.exit(1)
  }
}

module.exports = connectDB
