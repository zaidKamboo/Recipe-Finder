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

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await user.validatePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    setAuthCookie(res, token);

    const clientObj =
      typeof user.toClient === "function"
        ? user.toClient()
        : (() => {
            const o = user.toObject();
            delete o.passwordHash;
            delete o.__v;
            return o;
          })();

    return res.status(200).json({
      message: "Login successful",
      user: clientObj,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    const clientObj =
      typeof user.toClient === "function"
        ? user.toClient()
        : (() => {
            const o = user.toObject();
            delete o.passwordHash;
            delete o.__v;
            return o;
          })();

    return res.status(200).json({
      message: "Profile fetched",
      user: clientObj,
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, preferences, oldPassword, newPassword } = req.body;

    if ("email" in req.body) {
      return res.status(400).json({ message: "Email cannot be changed" });
    }

    const user = await User.findById(userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message:
            "Provide both oldPassword and newPassword to change password",
        });
      }
      const valid = await user.validatePassword(oldPassword);
      if (!valid)
        return res.status(401).json({ message: "Old password is incorrect" });
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          message: "New password must be a string with at least 6 characters",
        });
      }
      await user.setPassword(newPassword);
    }

    if (typeof name === "string" && name.trim().length) {
      user.name = name.trim();
    }

    if (typeof preferences === "string") {
      try {
        user.preferences = JSON.parse(preferences);
      } catch (e) {
        return res.status(400).json({ message: "Invalid preferences JSON" });
      }
    } else if (typeof preferences === "object" && preferences !== null) {
      user.preferences = preferences;
    }

    if (req.file && req.file.path) {
      user.profilePic = req.file.path;
    }

    const saved = await user.save();
    const clientObj =
      typeof saved.toClient === "function"
        ? saved.toClient()
        : (() => {
            const o = saved.toObject();
            delete o.passwordHash;
            delete o.__v;
            return o;
          })();
    return res
      .status(200)
      .json({ message: "Profile updated", user: clientObj });
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
