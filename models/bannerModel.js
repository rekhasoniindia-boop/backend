import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
      image: { type: String, required: true }, // Cloudinary image link
      link: { type: String }, // optional link (CTA)
      public_id: {
        type: String,   // 👈 yeh add karo
        required: true, // Cloudinary ke liye zaroori
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
      },
    },
    { timestamps: true }
  );
  
  const Banner = mongoose.model("Banner", bannerSchema);
  export default Banner;