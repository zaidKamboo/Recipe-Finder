const {
  uploadRecipeImageConfig,
} = require("../../config/upload-recipe-image..config");

const uploadRecipeImagesMiddleware = (req, res, next) => {
  uploadRecipeImageConfig.array("recipe-images", 10)(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).send({ error: err.message });
    }

    console.log("Upload successful", req.files);
    next();
  });
};

module.exports = uploadRecipeImagesMiddleware;
