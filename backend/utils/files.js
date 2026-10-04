const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function removeFile(absolutePath) {
  if (!absolutePath) return;
  fs.unlink(absolutePath, () => {});
}

// image is stored as "/uploads/<name>"; only ever touch files inside UPLOAD_DIR
function removeUploadedImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  removeFile(path.join(UPLOAD_DIR, path.basename(imagePath)));
}

module.exports = { UPLOAD_DIR, removeFile, removeUploadedImage };
