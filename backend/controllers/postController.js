const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { removeUploadedImage } = require("../utils/files");
const { str, escapeRegex, validatePost, throwIfInvalid, assertObjectId } = require("../utils/validators");

const AUTHOR_FIELDS = "username profileImage";

function paging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 9, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

// case-insensitive search on title, content, excerpt and author username
async function searchFilter(rawQuery) {
  const q = str(rawQuery).slice(0, 100);
  if (!q) return {};
  const rx = new RegExp(escapeRegex(q), "i");
  const authors = await User.find({ username: rx }).select("_id");
  return {
    $or: [{ title: rx }, { content: rx }, { excerpt: rx }, { author: { $in: authors.map((a) => a._id) } }],
  };
}

async function sendList(res, filter, query) {
  const { page, limit, skip } = paging(query);
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);
  res.json({ success: true, posts, page, pages: Math.max(Math.ceil(total / limit), 1), total });
}

const getPosts = asyncHandler(async (req, res) => {
  await sendList(res, await searchFilter(req.query.q), req.query);
});

const getMyPosts = asyncHandler(async (req, res) => {
  const search = await searchFilter(req.query.q);
  await sendList(res, { ...search, author: req.user._id }, req.query);
});

const getPost = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Post");
  const post = await Post.findById(req.params.id).populate("author", `${AUTHOR_FIELDS} bio createdAt`);
  if (!post) throw new AppError("Post not found.", 404);

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: -1 })
    .populate("author", AUTHOR_FIELDS);

  res.json({ success: true, post, comments });
});

const createPost = asyncHandler(async (req, res) => {
  const fields = { title: str(req.body.title), content: str(req.body.content), excerpt: str(req.body.excerpt) };
  throwIfInvalid(validatePost(fields));

  const post = await Post.create({
    ...fields,
    image: req.file ? `/uploads/${req.file.filename}` : "",
    author: req.user._id,
  });
  await post.populate("author", AUTHOR_FIELDS);
  res.status(201).json({ success: true, post });
});

const updatePost = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Post");
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError("Post not found.", 404);
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError("You can only edit your own posts.", 403);
  }

  const fields = { title: str(req.body.title), content: str(req.body.content), excerpt: str(req.body.excerpt) };
  throwIfInvalid(validatePost(fields));

  post.title = fields.title;
  post.content = fields.content;
  post.excerpt = fields.excerpt; // blank is refilled from content by the model

  const oldImage = post.image;
  if (req.file) {
    post.image = `/uploads/${req.file.filename}`;
  } else if (req.body.removeImage === "true") {
    post.image = "";
  }

  await post.save();
  if (post.image !== oldImage) removeUploadedImage(oldImage);

  await post.populate("author", AUTHOR_FIELDS);
  res.json({ success: true, post });
});

const deletePost = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Post");
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError("Post not found.", 404);
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError("You can only delete your own posts.", 403);
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  removeUploadedImage(post.image);

  res.json({ success: true, message: "Post deleted." });
});

module.exports = { getPosts, getMyPosts, getPost, createPost, updatePost, deletePost };
