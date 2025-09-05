import express from "express";
import { createProduct, deleteProduct, getProductForHero, getAllProducts } from "../controllers/product.js";
import { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile } from "../controllers/admin.js";
import { protect, adminOnly } from "../middlewares/authAdmin.js";
import { createBanners, getBanners } from "../controllers/banner.js";
// import { protect } from "../middleware/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// upload.fields allows multiple types of images
router.post(
  "/create",
  protect,
  adminOnly,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "smallImages", maxCount: 4 },
  ]),
  createProduct
);
router.get("/products", getProductForHero);
router.get("/allproducts", getAllProducts)
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/signup", registerAdmin);
router.post("/login", loginAdmin);
router.get('/ac/:id',protect, adminOnly, getAdminProfile)
// ✅ multiple banners ek saath add karne ke liye (Cloudinary upload)
router.post("/banner", protect, adminOnly, upload.array("images", 4), createBanners);
router.get("/banner", getBanners);
router.post("/logout", protect, adminOnly, logoutAdmin);

// router.get("/", getProducts);
// router.get("/:id", getProductById);

export default router;
