require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./utils/db");

// Admin routes
const adminUsersRouter = require("./routes/admin/user");
const adminAuthRouter = require("./routes/admin/auth");

// User routes
const userUsersRouter = require("./routes/users/user");
const userAuthRouter = require("./routes/users/auth");

// CORS options
const corsOptions = require("./config/cors");

const app = express();
const PORT = process.env.PORT || 4550;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors(corsOptions));

// Preflight OPTIONS için tüm yolları açık bırak
app.options("*", cors(corsOptions));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB bağlantısı
connectDB();

// Admin routes
app.use("/admin/auth", adminAuthRouter);
app.use("/admin/users", adminUsersRouter);

// User routes
app.use("/users/auth", userAuthRouter);
app.use("/users/users", userUsersRouter);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
