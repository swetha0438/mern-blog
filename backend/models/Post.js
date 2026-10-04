const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      minlength: [3, "Title must be at least 3 characters."],
      maxlength: [150, "Title must be 150 characters or fewer."],
    },
    content: {
      type: String,
      required: [true, "Content cannot be empty."],
      trim: true,
      minlength: [10, "Content must be at least 10 characters."],
      maxlength: [50000, "Content must be 50,000 characters or fewer."],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt must be 300 characters or fewer."],
      default: "",
    },
    image: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

// build an excerpt from the content when the author leaves it blank
postSchema.pre("validate", function fillExcerpt(next) {
  if (!this.excerpt && this.content) {
    const flat = this.content.replace(/\s+/g, " ").trim();
    this.excerpt = flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}...` : flat;
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
