const express = require("express");
const multer = require("multer");
const Product = require("../../models/Product");
const auth = require("../../middleware/auth");

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email ve şifre gerekli" });
  }

  try {
    // Case-insensitive email araması ve sadece role: 'user'
    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
      role: "user",
    });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Şifre yanlış" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: user.role,
        company: user.company,
        package: user.package,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Giriş yapılamadı" });
  }
});

// GET: Kullanıcıya ait tüm ürünler
router.get("/", auth("user"), async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id });
    const formatted = products.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode || "",
      image: product.image?.data
        ? `data:${
            product.image.contentType
          };base64,${product.image.data.toString("base64")}`
        : "",
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürünler alınamadı" });
  }
});

// GET: Tek ürün (sadece sahibi görebilir)
router.get("/:id", auth("user"), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, owner: req.user.id });
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

    res.status(200).json({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode || "",
      image: product.image?.data
        ? `data:${
            product.image.contentType
          };base64,${product.image.data.toString("base64")}`
        : "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün alınamadı" });
  }
});

// POST: Yeni ürün ekle
router.post("/", auth("user"), upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock, barcode } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur" });
    }

    const productData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      owner: req.user.id, // Sahip kullanıcının ID'si
    };

    if (barcode) productData.barcode = barcode;
    if (req.file) {
      productData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün eklenemedi" });
  }
});

// PUT: Ürün güncelle (sadece sahibi)
router.put("/:id", auth("user"), upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;

    const product = await Product.findOne({ _id: id, owner: req.user.id });
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock) product.stock = parseInt(stock, 10);
    if (barcode !== undefined) product.barcode = barcode;

    if (req.file) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
});

// DELETE: Ürün sil (sadece sahibi)
router.delete("/:id", auth("user"), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

    res.status(200).json({ message: "Ürün silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün silinemedi" });
  }
});

module.exports = router;
