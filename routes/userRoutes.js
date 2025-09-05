import express from "express";
import { registerUser, loginUser ,addFavourite, removeFavourite, getOneProduct, getProductsByCategory, getAllProducts, getFavorites } from "../controllers/user.js";
import { protect } from "../middlewares/authAdmin.js";

const router = express.Router();

// Register
router.post("/signup", registerUser);
// Login
router.post("/login", loginUser);

// user add and remove to favourites
router.get("/favourites", protect, getFavorites)
router.post("/favourites/:id", protect, addFavourite);
router.delete("/favourites/:id", protect, removeFavourite);

router.get('/product/:id', getOneProduct)
router.get('/products', getProductsByCategory)
router.get('/allproducts', getAllProducts)

export default router;  
