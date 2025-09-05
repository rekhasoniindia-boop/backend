import Product from "../models/productModel.js";
import Admin from "../models/adminModel.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, link, affiliate, youtube } = req.body;

    console.log(req.body);

    if (!name || !description || !category || !link || !affiliate) {
      return res.status(400).json({ message: "Please fill all details" });
    }

    const mainImage = req.files["mainImage"] ? req.files["mainImage"][0].path : null;
    const smallImages = req.files["smallImages"]
      ? req.files["smallImages"].map(file => file.path)
      : [];

    if (!mainImage) {
      return res.status(400).json({ message: "Main image is required" });
    }

    // ✅ Admin jo login hai wahi save hoga product me
    const product = await Product.create({
      name,
      description,
      category,
      link,
      affiliate,
      mainImage,
      smallImages,
      youtube,
      createdBy: req.admin._id, // 👈 admin ki id login se aa rahi hai
    });

    // ✅ Admin ke products array me bhi push kar do
    await Admin.findByIdAndUpdate(req.admin._id, {
      $push: { products: product._id },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    // agar product ke paas image public_id stored hai to cloudinary se bhi delete kar sakte ho
    if (product.public_id) {
      await cloudinary.uploader.destroy(product.public_id);
    }

    await Promise.all([
      product.deleteOne(),
      Admin.findByIdAndUpdate(req.admin._id, { $pull: { products: product._id } }),
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getProductForHero = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 }) // latest first
      .limit(4); // sirf 4 product

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.status(200).json(allProducts);
  } catch {
    res.status(500).json({message: "Server Error", error: error.message});
  }
};