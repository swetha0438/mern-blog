const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment cannot be empty."],
      trim: true,
      minlength: [1, "Comment cannot be empty."],
      maxlength: [1000, "Comment must be 1,000 characters or fewer."],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
