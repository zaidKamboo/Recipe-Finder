const Admin = require("../models/admin.model");
const { generateToken } = require("../utils/jwt.utils");

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:
      (parseInt(process.env.JWT_EXPIRES_SECONDS, 10) || 7 * 24 * 60 * 60) *
      1000,
  };
}

exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const existing = await Admin.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Username already taken" });

    const admin = new Admin({ username });
    await admin.setPassword(password);
    await admin.save();

    const token = generateToken(admin);
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({
      message: "Admin registered",
      admin: { id: admin._id, username: admin.username },
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await admin.validatePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin);
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      message: "Login successful",
      admin: { id: admin._id, username: admin.username },
    });
  } catch (err) {
    console.error("loginAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const admin = await Admin.findById(adminId).select("-passwordHash");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({ id: admin._id, username: admin.username });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { username, password } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (username && username !== admin.username) {
      const taken = await Admin.findOne({ username });
      if (taken)
        return res.status(400).json({ message: "Username already taken" });
      admin.username = username;
    }

    if (password) await admin.setPassword(password);

    await admin.save();

    const token = generateToken(admin);
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      message: "Admin updated",
      admin: { id: admin._id, username: admin.username },
    });
  } catch (err) {
    console.error("updateAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    await Admin.findByIdAndDelete(adminId);

    // clear cookie
    res.clearCookie("token", cookieOptions());

    return res.status(200).json({ message: "Admin account deleted" });
  } catch (err) {
    console.error("deleteAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logoutAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
