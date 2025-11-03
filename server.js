require("dotenv").config();
const express = require("express");
const corsOptions = require("./config/cors");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./utils/db");
const onlineUsers = require("./utils/onlineUsers");

// ROUTES
const productsRouter = require("./routes/products");

// ADMIN PANEL ROUTES
const adminRouter = require("./routes/admin/user");
const adminAuthRouter = require("./routes/admin/auth");
const adminStatsRouter = require("./routes/admin/stats");

// USER PANEL ROUTES
const usersRouter = require("./routes/users/user");
const usersAuthRouter = require("./routes/users/auth");
const userStatsRouter = require("./routes/users/stats");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
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

// ✅ SOCKET.IO bağlanıyor
io.on("connection", (socket) => {
  console.log("🟢 Yeni bağlantı:", socket.id);
  onlineUsers.add(socket.id);
  io.emit("online_users", onlineUsers.size);

  socket.on("disconnect", () => {
    console.log("🔴 Kullanıcı ayrıldı:", socket.id);
    onlineUsers.delete(socket.id);
    io.emit("online_users", onlineUsers.size);
  });
});

// ✅ ROUTES
app.use("/api/products", productsRouter);

// ADMIN PANEL
app.use("/api/admin/users", adminRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/stats", adminStatsRouter);

// USER PANEL
app.use("/api/users/users", usersRouter);
app.use("/api/users/auth", usersAuthRouter);
app.use("/api/users/stats", userStatsRouter);

// ✅ SERVER BAŞLAT
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
