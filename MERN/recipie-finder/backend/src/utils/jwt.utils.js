// src/utils/jwt.utils.js
const jwt = require("jsonwebtoken");
const COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_MAX_AGE =
  Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

const generateToken = (u) =>
  jwt.sign({ id: u._id, email: u.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  };
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

module.exports = {
  generateToken,
  setAuthCookie,
  COOKIE_NAME,
};
