const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { removeUploadedImage } = require("../utils/files");
const { str } = require("../utils/validators");

const updateMe = asyncHandler(async (req, res) => {
  const user = req.user;

  if (req.body.bio !== undefined) {
    const bio = str(req.body.bio);
    if (bio.length > 300) {
      throw new AppError("Bio must be 300 characters or fewer.", 400, { bio: "Bio must be 300 characters or fewer." });
    }
    user.bio = bio;
  }

  if (req.file) {
    removeUploadedImage(user.profileImage);
    user.profileImage = `/uploads/${req.file.filename}`;
  } else if (req.body.removeImage === "true") {
    removeUploadedImage(user.profileImage);
    user.profileImage = "";
  }

  await user.save();
  res.json({ success: true, user });
});

module.exports = { updateMe };
