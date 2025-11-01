// config/cors.js
const cors = require("cors");

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3008', // admin paneli
    'http://localhost:5000', // backend
    'https://stock-user-panel.vercel.app', // kullanıcı paneli
    'https://stock-admin-panel.vercel.app' // admin paneli
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      // Postman veya curl gibi origin yoksa da izin ver
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS hatası: Bu origin izinli değil'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // cookie vs için
    allowedHeaders: ['Content-Type', 'Authorization'], // header izinleri
  };
  
  module.exports = corsOptions;
  
