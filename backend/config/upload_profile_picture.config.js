const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.config");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "recipe-finder/profile-pictures",
    format: async (_, file) => {
      const formats = ["jpg", "jpeg", "png", "webp"];
      const ext = file.mimetype.split("/")[1];
      return formats.includes(ext) ? ext : "jpg";
    },
    public_id: (_, file) => `profile_${Date.now()}_${file.originalname}`,
  },
});

exports.uploadProfilePictureConfig = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});
