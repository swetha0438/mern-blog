const router = require("express").Router();
const { updateMe } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.patch("/me", protect, uploadImage, updateMe);

module.exports = router;
