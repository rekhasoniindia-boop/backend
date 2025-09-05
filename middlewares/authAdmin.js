import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ab decoded ke andar id + role dono honge
    req.user = decoded; // { id, role }

    console.log("Decoded:", decoded);

    if (decoded.role === "admin") {
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      console.log("Admin details:", req.admin);
    } else {
      req.userDetails = await User.findById(decoded.id).select("-password");
      if (!req.userDetails) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("User details:", req.userDetails);
    }

    console.log("req.admin", req.admin)
    console.log("req.userDetails", req.userDetails)

    next();
  } catch (error) {
    console.error("Protect middleware error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};


// 🔒 Only Admin middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    console.log("data mil gaya re",req.user, req.admin)
    next();
    
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};