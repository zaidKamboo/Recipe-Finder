const router = require("express").Router();
const adminController = require("../controllers/admin.controllers");
const { isAdmin } = require("../middlewares/admin.middleware");

router.post("/register", isAdmin, adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

router.get("/profile", isAdmin, adminController.getAdminProfile);
router.put("/update", isAdmin, adminController.updateAdmin);
router.delete("/delete", isAdmin, adminController.deleteAdmin);
router.post("/logout", isAdmin, adminController.logoutAdmin);

module.exports = router;
