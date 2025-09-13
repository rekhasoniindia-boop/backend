import Product from "../models/productModel.js";
import Admin from "../models/adminModel.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, link, affiliate, youtube, hashtags } = req.body;

    if (!name || !description || !category || !link || !affiliate) {
      return res.status(400).json({ message: "Please fill all details" });
    }

    const mainImage = req.files["mainImage"] ? req.files["mainImage"][0].path : null;
    const smallImages = req.files["smallImages"]
      ? req.files["smallImages"].map((file) => file.path)
      : [];

    if (!mainImage) {
      return res.status(400).json({ message: "Main image is required" });
    }

    // 👇 hashtags handle karo (React se JSON.stringify karke aata hai)
    let parsedHashtags = [];
    if (hashtags) {
      try {
        parsedHashtags = JSON.parse(hashtags);
      } catch (err) {
        // agar JSON nahi hai to fallback string ko array bana do
        parsedHashtags = Array.isArray(hashtags) ? hashtags : [hashtags];
      }
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
      hashtags: parsedHashtags, // 👈 save hashtags
      createdBy: req.admin._id,
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
    // ✅ Sirf us admin ke products jiska login hai
    const allProducts = await Product.find({createdBy: req.params.id});
    console.log("req admin data hai")

    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("req body hai ye ",req.body)
    const { name, description, category, link, affiliate, youtube, hashtags } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update only details
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (link) product.link = link;
    if (affiliate) product.affiliate = affiliate;
    if (youtube) product.youtube = youtube;
    if (hashtags) product.hashtags = JSON.parse(hashtags); // hashtags JSON se parse

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}