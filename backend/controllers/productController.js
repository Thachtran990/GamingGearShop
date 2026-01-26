const Product = require('../models/productModel');

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // Lấy tất cả
        res.json(products); // Trả về dạng JSON
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy 1 sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Tìm theo ID trên link

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id }); // Lệnh xóa
      res.json({ message: "Đã xóa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

const createProduct = async (req, res) => {
  const { name, price, description, image, category, brand } = req.body;

  try {
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      brand, // 2. Thêm brand vào dòng này nữa
      countInStock: 0, // Mặc định kho = 0
      rating: 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.log("LOG LỖI CHI TIẾT:", error);
    res.status(400).json({ message: "Lỗi tạo sản phẩm" });
  }
};


const updateProduct = async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct // <--- Thêm cái này
};