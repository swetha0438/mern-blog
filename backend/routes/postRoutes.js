const router = require("express").Router();
const {
  getPosts,
  getMyPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

// fixed paths must come before "/:id"
router.get("/search", getPosts);
router.get("/mine", protect, getMyPosts);

router.get("/", getPosts);
router.post("/", protect, uploadImage, createPost);

router.get("/:id", getPost);
router.put("/:id", protect, uploadImage, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
