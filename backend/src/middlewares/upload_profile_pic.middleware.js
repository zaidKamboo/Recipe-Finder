const {
  uploadProfilePictureConfig,
} = require("../../config/upload_profile_picture.config");

const uploadProfilePictureMiddleware = (req, res, next) => {
  const hasFile =
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data");

  // If no multipart request OR no profilePic field → skip multer
  if (!hasFile) return next();

  const mw = uploadProfilePictureConfig.single("profilePic");

  mw(req, res, (err) => {
    if (err) {
      console.error("Profile picture upload error:", err);
      return res.status(400).json({ error: err.code || err.message });
    }
    next();
  });
};

module.exports = uploadProfilePictureMiddleware;
