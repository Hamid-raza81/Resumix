const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 24 * 60 * 60 * 1000,
});

function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email };
}

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

async function registerUserController(req, res) {
  const username = req.body.username?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!username || !email || !password) return res.status(400).json({ message: "Username, email and password are required." });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  const exists = await userModel.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: "An account already exists with that username or email." });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ username, email, password: passwordHash });
  res.cookie("token", createToken(user), cookieOptions());
  return res.status(201).json({ message: "User registered successfully.", user: publicUser(user) });
}

async function loginUserController(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const user = await userModel.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.cookie("token", createToken(user), cookieOptions());
  return res.status(200).json({ message: "Login successful.", user: publicUser(user) });
}

async function logoutUserController(req, res) {
  const token = req.cookies?.token;
  if (token) await tokenBlacklistModel.create({ token });
  return res.clearCookie("token", { ...cookieOptions(), maxAge: undefined }).status(200).json({ message: "Logged out successfully." });
}

async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id).select("username email");
  if (!user) return res.status(401).json({ message: "User no longer exists." });
  return res.json({ message: "User details fetched successfully.", user: publicUser(user) });
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };
