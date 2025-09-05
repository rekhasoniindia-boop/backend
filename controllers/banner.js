import Banner from "../models/bannerModel.js";
import Admin from "../models/adminModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Create multiple banners (Admin only, max 4 allowed in DB)
// @route   POST /api/banners
// @access  Private/Admin
export const createBanners = async (req, res) => {
  try {
    // agar files hi nahi bheje gaye
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // purane banners nikaalo
    const existingBanners = await Banner.find();

    // agar pehle se 4 banners hain to unhe delete karo
    if (existingBanners.length >= 4) {
      for (let banner of existingBanners) {
        // cloudinary se delete karo
        await cloudinary.uploader.destroy(banner.public_id);

        // db se delete karo
        await Banner.findByIdAndDelete(banner._id);
      }
    }

    // ab naye banners upload karo
    const uploadedBanners = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // cloudinary upload
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: "banners",
      });

      const banner = await Banner.create({
        image: uploaded.secure_url,
        public_id: uploaded.public_id,
        link: Array.isArray(req.body.links) ? req.body.links[i] : req.body.link || "",
        createdBy: req.admin._id,
      });

      uploadedBanners.push(banner);

      // admin me bhi push karna ho to
      await Admin.findByIdAndUpdate(req.admin._id, {
        $push: { banners: banner._id },
      });
    }

    res.status(201).json({
      message: "Banners replaced successfully",
      banners: uploadedBanners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  // @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
    try {
      const banners = await Banner.find().sort({ createdAt: -1 });
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };