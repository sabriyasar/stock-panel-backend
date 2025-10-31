require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./utils/db');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = [
  'http://localhost:3000',               // local frontend
  'http://localhost:5000',
  'https://stock-panel-six.vercel.app', // prod frontend
  'https://stock-panel-backend-1.onrender.com',
];
app.use(cors({
  origin: function(origin, callback) {
    // origin null olabilir (Postman, curl vs için)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB bağlantısı
connectDB();

// Routes
app.use('/api/products', productsRouter);

// Server start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
