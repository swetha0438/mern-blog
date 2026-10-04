const router = require("express").Router();
const { getComments, createComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", protect, createComment);
router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;
