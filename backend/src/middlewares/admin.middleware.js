const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

exports.isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    // Token may be from a User login — ensure it's an Admin
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    req.admin = admin; 
    req.user = decoded; 

    next();
  } catch (err) {
    console.error("isAdmin error:", err.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};
