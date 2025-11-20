// src/utils/asyncHandler.js
/**
 * Wrap a single async route handler and forward errors to next(err)
 * Usage: router.get('/', asyncHandler(async (req,res,next) => { ... }));
 */
function asyncHandler(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("asyncHandler expects a function");
  }
  return function (req, res, next) {
    // Ensure returned promise rejection is forwarded to next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap all functions on an object (e.g. controller module) with asyncHandler.
 * Usage:
 *   const userCtrl = require('../controllers/userController');
 *   const wrapped = wrapAsync(userCtrl);
 *   router.post('/register', wrapped.register);
 *
 * This keeps your route files clean and avoids repeating asyncHandler(...)
 */
function wrapAsync(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const wrapped = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    wrapped[key] = typeof val === "function" ? asyncHandler(val) : val;
  }
  return wrapped;
}
const jwt = require("jsonwebtoken");

// cookie helper
function setTokenCookie(res, user) {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // set TRUE in production (HTTPS)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

module.exports = { asyncHandler, wrapAsync, setTokenCookie };
