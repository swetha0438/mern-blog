const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.token || (header?.startsWith("Bearer ") ? header.slice(7) : null);
  if (!token) throw new AppError("Please log in to continue.", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Your session has expired. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("Your account no longer exists.", 401);

  req.user = user;
  next();
});

module.exports = { protect };
