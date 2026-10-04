const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { str, escapeRegex, validateRegister, throwIfInvalid, EMAIL_RE } = require("../utils/validators");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.COOKIE_SAMESITE || "lax",
  maxAge: WEEK_MS,
});

function sendSession(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions()).status(status).json({ success: true, user });
}

const register = asyncHandler(async (req, res) => {
  const username = str(req.body.username);
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  throwIfInvalid(validateRegister({ username, email, password }));

  const [emailTaken, usernameTaken] = await Promise.all([
    User.exists({ email }),
    User.exists({ username: new RegExp(`^${escapeRegex(username)}$`, "i") }),
  ]);
  if (emailTaken || usernameTaken) {
    const errors = {};
    if (emailTaken) errors.email = "That email is already registered.";
    if (usernameTaken) errors.username = "That username is taken.";
    throw new AppError("An account with those details already exists.", 409, errors);
  }

  const user = await User.create({ username, email, password });
  sendSession(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  const errors = {};
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  throwIfInvalid(errors);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }
  sendSession(res, user);
});

const logout = (req, res) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie("token", options).json({ success: true, message: "Logged out." });
};

const me = (req, res) => res.json({ success: true, user: req.user });

module.exports = { register, login, logout, me };
