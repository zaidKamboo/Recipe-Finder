const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {
  generateToken,
  setAuthCookie,
  COOKIE_NAME,
} = require("../utils/jwt.utils");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, preferences });
    await user.setPassword(password);
    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.validatePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, preferences } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, preferences },
      { new: true }
    ).select("-passwordHash");

    return res.status(200).json({
      message: "Profile updated",
      user: updated,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME , {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
