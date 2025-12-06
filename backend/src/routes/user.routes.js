const router = require("express").Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteUser,
  logoutUser,
} = require("../controllers/user.controllers");

const { isAuthenticated } = require("../middlewares/auth.middleware");
const uploadProfilePictureMiddleware = require("../middlewares/upload_profile_pic.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getProfile);
router.put(
  "/profile",
  uploadProfilePictureMiddleware,
  isAuthenticated,
  updateProfile
);
router.delete("/profile", isAuthenticated, deleteUser);
router.post("/logout", logoutUser);

module.exports = router;
