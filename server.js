require("dotenv").config();
const express = require("express");
const corsOptions = require("./config/cors");
const cors = require("cors");
const path = require("path");
const http = require("http"); // 👈 HTTP sunucusu oluşturmak için
const { Server } = require("socket.io"); // 👈 Socket.IO importu

const connectDB = require("./utils/db");
const productsRouter = require("./routes/products");

// ADMIN PANEL ROUTES
const adminRouter = require("./routes/admin/user");
const adminAuthRouter = require("./routes/admin/auth");

// USER PANEL ROUTES
const usersRouter = require("./routes/users/user");
const usersAuthRouter = require("./routes/users/auth");

const app = express();
const server = http.createServer(app); // 👈 Express'i HTTP server'a bağla
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4550;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB bağlantısı
connectDB();

// ✅ Çevrimiçi kullanıcıları takip etmek için Set
let onlineUsers = new Set();

// ✅ Socket.io eventleri
io.on("connection", (socket) => {
  console.log("🟢 Yeni bağlantı:", socket.id);

  // Kullanıcı login olunca frontend’den userId ile gönderilecek
  socket.on("user_online", (userId) => {
    onlineUsers.add(userId);
    io.emit("online_count", onlineUsers.size); // herkese bildir
  });

  // Kullanıcı sekmeyi kapattığında
  socket.on("disconnect", () => {
    console.log("🔴 Kullanıcı ayrıldı:", socket.id);
    // Kullanıcı ID yerine socket.id tutuluyorsa sil
    onlineUsers.delete(socket.id);
    io.emit("online_count", onlineUsers.size);
  });
});

// Routes
app.use("/api/products", productsRouter);

// ADMIN PANEL
app.use("/api/admin/users", adminRouter);
app.use("/api/admin/auth", adminAuthRouter);

// USER PANEL
app.use("/api/users/users", usersRouter);
app.use("/api/users/auth", usersAuthRouter);

// ✅ Admin istatistik endpoint (çevrimiçi kullanıcı sayısı dahil)
app.get("/api/admin/users/stats", (req, res) => {
  res.json({
    onlineUsers: onlineUsers.size
  });
});

// Server start
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});