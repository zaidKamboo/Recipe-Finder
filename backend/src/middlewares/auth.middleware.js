const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) 
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};
