const Recipe = require("../models/recipe.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Ingredient = require("../models/ingredient.model");
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

exports.getDashboardDetails = async (req, res) => {
  try {
    // require admin auth (adjust depending on your auth middleware)
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    // run multiple queries in parallel for speed
    const countsPromise = Promise.all([
      Recipe.countDocuments().catch(() => 0),
      User.countDocuments().catch(() => 0),
      Admin.countDocuments().catch(() => 0),
    ]);

    // recent recipes (most recent 8) — select fields safe to send to admin UI
    const recentRecipesPromise = Recipe.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("title category createdAt images description")
      .lean();

    // recipes by category aggregation
    const byCategoryPromise = Recipe.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$category", "uncategorized"] },
          count: { $sum: 1 },
        },
      },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    // top recipes (by popularity or createdAt fallback) — try to use 'popularity' if exists
    const topRecipesPromise = Recipe.find({})
      .sort({ popularity: -1, createdAt: -1 })
      .limit(6)
      .select("title category popularity images")
      .lean()
      .catch(() => []);

    // pending reviews — optional model, gracefully fallback to 0 if no Review model
    let pendingReviewsPromise;
    try {
      // try to require review model (if you have one)
      // adjust path/name to your actual review model file
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const Review = require("../models/review.model");
      pendingReviewsPromise = Review.countDocuments({
        status: "pending",
      }).catch(() => 0);
    } catch (e) {
      pendingReviewsPromise = Promise.resolve(0);
    }

    const [
      [totalRecipes, totalUsers, totalAdmins],
      recentRecipes,
      recipesByCategory,
      topRecipes,
      pendingReviews,
    ] = await Promise.all([
      countsPromise,
      recentRecipesPromise,
      byCategoryPromise,
      topRecipesPromise,
      pendingReviewsPromise,
    ]);

    const summary = {
      totalRecipes: Number(totalRecipes) || 0,
      totalUsers: Number(totalUsers) || 0,
      totalAdmins: Number(totalAdmins) || 0,
      pendingReviews: Number(pendingReviews) || 0,
      recipesByCategory: Array.isArray(recipesByCategory)
        ? recipesByCategory
        : [],
      recentRecipes: Array.isArray(recentRecipes) ? recentRecipes : [],
      topRecipes: Array.isArray(topRecipes) ? topRecipes : [],
      fetchedAt: new Date().toISOString(),
    };

    return res
      .status(200)
      .json({ message: "Dashboard details", data: summary });
  } catch (err) {
    console.error("getDashboardDetails error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardDetails = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const countsPromise = Promise.all([
      Recipe.countDocuments().catch(() => 0),
      User.countDocuments().catch(() => 0),
      Admin.countDocuments().catch(() => 0),
      Ingredient.countDocuments().catch(() => 0),
    ]);

    const recentRecipesPromise = Recipe.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("title category createdAt images description")
      .lean()
      .catch(() => []);

    const byCategoryPromise = Recipe.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$category", "uncategorized"] },
          count: { $sum: 1 },
        },
      },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    const topRecipesPromise = Recipe.find({})
      .sort({ popularity: -1, createdAt: -1 })
      .limit(6)
      .select("title category popularity images")
      .lean()
      .catch(() => []);

    const [
      [totalRecipes, totalUsers, totalAdmins, totalIngredients],
      recentRecipes,
      recipesByCategory,
      topRecipes,
    ] = await Promise.all([
      countsPromise,
      recentRecipesPromise,
      byCategoryPromise,
      topRecipesPromise,
    ]);

    const summary = {
      totalRecipes: Number(totalRecipes) || 0,
      totalUsers: Number(totalUsers) || 0,
      totalAdmins: Number(totalAdmins) || 0,
      totalIngredients: Number(totalIngredients) || 0,
      recipesByCategory: Array.isArray(recipesByCategory)
        ? recipesByCategory
        : [],
      recentRecipes: Array.isArray(recentRecipes) ? recentRecipes : [],
      topRecipes: Array.isArray(topRecipes) ? topRecipes : [],
      fetchedAt: new Date().toISOString(),
    };

    return res
      .status(200)
      .json({ message: "Dashboard details", data: summary });
  } catch (err) {
    console.error("getDashboardDetails error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
