const {
  uploadRecipeImageConfig,
} = require("../../config/upload-recipe-image..config");

const uploadRecipeImagesMiddleware = (req, res, next) => {
  // uploadRecipeImageConfig.array("recipe-images", 10)(req, res, (err) => {
  //   if (err) {
  //     console.error("Upload error:", err);
  //     return res.status(400).send({ error: err.message });
  //   }

  //   console.log("Upload successful", req.files);
  //   next();
  // });
  const mw = uploadRecipeImageConfig.array("recipe-images", 10); // or upload.fields([...])
  mw(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.code || err.message });
    }
    // req.files is now an array (for array()) or object (for fields())
    next();
  });
};

module.exports = uploadRecipeImagesMiddleware;
