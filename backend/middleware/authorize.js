// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
      })
    }

    next()
  }
}

// Check if user owns the resource or is admin/HOD
exports.checkOwnership = (model, paramName = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName]
      const resource = await model.findById(resourceId)

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        })
      }

      // Admin and HOD can access any resource
      if (req.user.role === "admin" || req.user.role === "hod") {
        return next()
      }

      // Check if user owns the resource
      if (resource.student && resource.student.toString() === req.user._id.toString()) {
        return next()
      }

      // For advisor, check if resource belongs to their assigned division/batch
      if (req.user.role === "advisor") {
        if (resource.student) {
          const student = await require("../models/User").findById(resource.student)
          if (
            student &&
            ((student.division && req.user.assignedDivisions.includes(student.division)) ||
              (student.batch && req.user.assignedBatches.includes(student.batch)))
          ) {
            return next()
          }
        }
      }

      return res.status(403).json({
        success: false,
        error: "Not authorized to access this resource",
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Authorization error",
      })
    }
  }
}

