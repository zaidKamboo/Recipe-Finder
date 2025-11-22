const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.config");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "recipe-finder/recipe-images",
    format: async (_, file) => {
      const formats = ["jpg", "jpeg", "png", "gif", "webp"];
      const mimeType = file.mimetype.split("/")[1];
      return formats.includes(mimeType) ? mimeType : "jpg";
    },
    public_id: (_, file) => `${Date.now()}_${file.originalname}`,
  },
});

exports.uploadRecipeImageConfig = multer({ storage: storage });
