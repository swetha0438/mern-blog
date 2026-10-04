const Post = require("../models/Post");
const Comment = require("../models/Comment");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { str, throwIfInvalid, assertObjectId } = require("../utils/validators");

async function requirePost(postId) {
  assertObjectId(postId, "Post");
  if (!(await Post.exists({ _id: postId }))) throw new AppError("Post not found.", 404);
}

const getComments = asyncHandler(async (req, res) => {
  await requirePost(req.params.postId);
  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: -1 })
    .populate("author", "username profileImage");
  res.json({ success: true, comments });
});

const createComment = asyncHandler(async (req, res) => {
  await requirePost(req.params.postId);

  const content = str(req.body.content);
  const errors = {};
  if (!content) errors.content = "Comment cannot be empty.";
  else if (content.length > 1000) errors.content = "Comment must be 1,000 characters or fewer.";
  throwIfInvalid(errors);

  const comment = await Comment.create({ content, post: req.params.postId, author: req.user._id });
  await comment.populate("author", "username profileImage");
  res.status(201).json({ success: true, comment });
});

const deleteComment = asyncHandler(async (req, res) => {
  assertObjectId(req.params.commentId, "Comment");
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError("Comment not found.", 404);
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new AppError("You can only delete your own comments.", 403);
  }
  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted." });
});

module.exports = { getComments, createComment, deleteComment };
