const User = require("../models/User")
const { generateToken } = require("../middleware/auth")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Register user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNo, department, program, year, division, batch } = req.body

  // Check if user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "User with this email already exists",
    })
  }

  // Check if rollNo exists (for students)
  if (role === "student" && rollNo) {
    const existingRollNo = await User.findOne({ rollNo })
    if (existingRollNo) {
      return res.status(400).json({
        success: false,
        error: "Roll number already exists",
      })
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    rollNo: role === "student" ? rollNo : undefined,
    department: department || undefined,
    program: program || undefined,
    year: year || undefined,
    division: division || undefined,
    batch: batch || undefined,
  })

  const token = generateToken(user._id)

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Please provide email and password",
    })
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password").populate("department program year division batch assignedDivisions")
console.log(user)
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    })
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: "Account is deactivated",
    })
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = generateToken(user._id)

  res.status(200).json({
    success: true,
    data: {
      user,
      token,
    },
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("department program year division batch")
    .populate("assignedDivisions")

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
  }

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "Please provide current and new password",
    })
  }

  const user = await User.findById(req.user._id).select("+password")

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      error: "Current password is incorrect",
    })
  }

  user.password = newPassword
  await user.save()

  const token = generateToken(user._id)

  res.status(200).json({
    success: true,
    data: {
      user,
      token,
    },
  })
})

