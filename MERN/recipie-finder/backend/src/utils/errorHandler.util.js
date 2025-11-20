// src/middleware/errorHandler.js

/**
 * Centralized error-handling middleware.
 * Should be the LAST middleware registered in app.js
 */
module.exports = function errorHandler(err, req, res, next) {
  // Default status code and message
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Log detailed info (only in development)
  if (process.env.NODE_ENV === "development") {
    console.error("❌ ERROR:", err);
  } else {
    console.error(`❌ ${status} - ${message}`);
  }

  // Handle common known error types gracefully
  if (err.name === "ValidationError") {
    // Mongoose validation errors
    status = 400;
    const fields = Object.keys(err.errors || {});
    message = `Validation failed${
      fields.length ? `: ${fields.join(", ")}` : ""
    }`;
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    status = 400;
    message = "Invalid ID format";
  }

  if (err.code && err.code === 11000) {
    // Duplicate key error (Mongo unique constraint)
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field '${field}'`;
  }

  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid or malformed token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired, please login again";
  }

  // Prepare response payload
  const payload = {
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  };

  // Optional: for validation errors include error details
  if (
    err.errors &&
    Object.keys(err.errors).length &&
    process.env.NODE_ENV === "development"
  ) {
    payload.error.details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  }

  res.status(status).json(payload);
};
