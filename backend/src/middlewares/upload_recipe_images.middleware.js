const {
  uploadRecipeImageConfig,
} = require("../../config/upload_recipe_images.config");

const uploadRecipeImagesMiddleware = (req, res, next) => {
  const mw = uploadRecipeImageConfig.array("recipe-images", 10);
  mw(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.code || err.message });
    }
    next();
  });
};

module.exports = uploadRecipeImagesMiddleware;
