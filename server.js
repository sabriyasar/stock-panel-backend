require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const connectDB = require('./utils/db')
const productsRouter = require('./routes/products')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'], // frontend ve backend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// MongoDB bağlantısı
connectDB()

// Routes
app.use('/api/products', productsRouter)

// Server start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
