require("dotenv").config();
const express = require("express");
const corsOptions = require("./config/cors");
const cors = require("cors");
const path = require("path");

const connectDB = require("./utils/db");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/admin/user");
const authRouter = require("./routes/admin/auth");

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

// Routes
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/* require("dotenv").config();
const express = require("express");
const corsOptions = require("./config/cors");
const cors = require("cors");
const path = require("path");

const connectDB = require("./utils/db");
const productsRouter = require("./routes/products");

// ADMIN PANEL ROUTES
const adminRouter = require("./routes/admin/user");
const adminAuthRouter = require("./routes/admin/auth");

// USER PANEL ROUTES
const usersRouter = require("./routes/users/user");
const usersAuthRouter = require("./routes/users/auth");

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

// Routes
app.use("/api/products", productsRouter);

// ADMIN PANEL
app.use("/api/admin/users", adminRouter);
app.use("/api/admin/auth", adminAuthRouter);

// USER PANEL
app.use("/api/users/users", usersRouter);
app.use("/api/users/auth", usersAuthRouter);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); */