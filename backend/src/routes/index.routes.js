const router = require("express").Router();
const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");
const recipeRoutes = require("./recipe.routes");

router.use("/auth", userRoutes);
router.use("/admin", adminRoutes);
router.use("/recipes", recipeRoutes);

module.exports = router;
