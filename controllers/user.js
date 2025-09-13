import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Product from "../models/productModel.js";

// generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// user register
// @desc    Register new user (signup)
// @route   POST /api/users/signup
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, contact } = req.body;
  console.log("Signup request body:", req.body); // 🟢 Debug

  try {
    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contact,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, "user"),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// user login
// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check for user
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getOneProduct = async (req, res) => {
  try {
    const { id } = req.params; // URL se id nikal lo

    const product = await Product.findById(id); // MongoDB se fetch karo

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product); // ✅ product bhej do
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// route: /api/users/products?category=Shoes
export const getProductsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.query; // query param se hashtag aayega
    console.log(req.query);

    if (!hashtag) {
      return res.status(400).json({ message: "Hashtag is required" });
    }

    // normalize hashtag (# ke saath aur bina # dono handle karenge)
    const normalized = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

    // regex use karenge taaki partial search bhi ho jaaye
    const products = await Product.find({
      hashtags: { $regex: new RegExp(normalized, "i") },
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// 👇 yahi function maine pehle diya tha
export const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search || "";

    // agar search param diya hai to name aur category dono me filter karo
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export const getFavorites = async (req, res) => {
  try {
    // req.user.id authMiddleware se milega (JWT decode karke)
    const user = await User.findById(req.user.id).populate("favourites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      favourites: user.favourites, // populated product objects
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Add product to favourites
// @route   POST /api/users/favourites/:id
// @access  Private
export const addFavourite = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // clean null values
    user.favourites = user.favourites.filter(fav => fav !== null);

    // check if already fav
    const alreadyFav = user.favourites.some(
      fav => fav.toString() === productId.toString()
    );

    if (alreadyFav) {
      // remove
      user.favourites = user.favourites.filter(
        fav => fav.toString() !== productId.toString()
      );
    } else {
      // add
      user.favourites.push(productId);
    }

    await user.save();

    console.log("req.params.pid:", req.params.pid);
console.log("User favourites before:", user.favourites);

    return res.json({
      message: "Favourites updated",
      favourites: user.favourites,
    });
  } catch (err) {
    console.error("AddFavourite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Remove product from favourites
// @route   DELETE /api/users/favourites/:id
// @access  Private
export const removeFavourite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    user.favourites = user.favourites.filter(
      fav => fav.toString() !== product._id.toString()
    );
    await user.save();

    res.json({ message: "Product removed from favourites", favourites: user.favourites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};