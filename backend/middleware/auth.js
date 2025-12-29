const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route. Please provide a token.",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        })
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: "User account is deactivated",
        })
      }

      next()
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authentication error",
    })
  }
}

// Generate JWT token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  })
}

