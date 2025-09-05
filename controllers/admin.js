import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Signup (Register new admin)
// @route POST /api/admin/signup
// @access Public (but ideally only super-admin can create)
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const adminCount = await Admin.countDocuments();
    if (adminCount >= 3) {
      return res.status(400).json({ message: "Only 3 admins allowed!" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Login admin
// @route POST /api/admin/login
// @access Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    console.log(admin)

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    } 
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password"); 
    // password ko hide kar diya
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
  
}

// @desc Logout admin (frontend can just delete token, but we can send message)
// @route POST /api/admin/logout
// @access Private
export const logoutAdmin = (req, res) => {
  res.json({ message: "Admin logged out successfully" });
};
