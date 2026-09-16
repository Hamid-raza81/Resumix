const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    const blacklisted = await tokenBlacklistModel.exists({ token });
    if (blacklisted) return res.status(401).json({ message: "Session is invalid." });

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = { authUser };
