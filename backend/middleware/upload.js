const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const AppError = require("../utils/AppError");
const { UPLOAD_DIR, removeFile } = require("../utils/files");

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // random name + extension chosen by us, never the user's filename
  filename: (req, file, cb) =>
    cb(null, crypto.randomBytes(16).toString("hex") + EXTENSIONS[file.mimetype]),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new AppError("Only JPG, PNG, WebP or GIF images are allowed.", 400));
  },
}).single("image");

// the mimetype header is client-controlled, so also check the file's real signature
function hasImageSignature(filePath) {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(12);
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isGif = buf.subarray(0, 3).toString("ascii") === "GIF";
  const isWebp =
    buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  return isJpeg || isPng || isGif || isWebp;
}

function verifyImage(req, res, next) {
  if (!req.file) return next();
  if (!hasImageSignature(req.file.path)) {
    removeFile(req.file.path);
    req.file = undefined;
    return next(new AppError("That file is not a valid image.", 400));
  }
  next();
}

module.exports = { uploadImage: [upload, verifyImage] };
