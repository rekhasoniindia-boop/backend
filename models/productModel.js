import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Electronics",
        "Fashion",
        "Home & Kitchen",
        "Beauty & Personal Care",
        "Sports & Outdoors",
        "Toys & Baby Products",
        "Books & Stationery",
        "Automotive & Accessories",
        "Health & Wellness",
        "Pet Supplies",
      ],
      required: true,
    },
    link: { type: String, required: true },
    affiliate: {
      type: String,
      enum: [
        "Amazon",
        "Flipkart",
        "Ajio",
        "Myntra",
        "Shopsy",
        "Nykaa",
        "mamaearth",
        "wow",
        "shyaway",
      ],
      required: true,
    },
    mainImage: { type: String, required: true }, // Cloudinary URL
    smallImages: [{ type: String }], // array of Cloudinary URLs
    youtube: { type: String },

    // 👇 New field for hashtags
    hashtags: [{ type: String }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
