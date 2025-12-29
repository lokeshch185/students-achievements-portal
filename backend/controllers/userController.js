const User = require("../models/User")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, department, program, year, division, batch, search, page = 1, limit = 10 } = req.query
  const query = { isActive: true }

  if (role) query.role = role
  if (department) query.department = department
  if (program) query.program = program
  if (year) query.year = year
  if (division) query.division = division
  if (batch) query.batch = batch

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ]
  }

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const startIndex = (pageNum - 1) * limitNum

  const users = await User.find(query)
    .select("-password")
    .populate("department program year division batch")
    .populate("assignedDivisions")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limitNum)

  const total = await User.countDocuments(query)

  res.status(200).json({
    success: true,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: users,
  })
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("department program year division batch")
    .populate("assignedDivisions")

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    })
  }

  console.log(user)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  // Validate required fields
  if (!req.body.password && req.body.role !== "admin") {
    return res.status(400).json({
      success: false,
      error: "Password is required",
    })
  }

  const user = await User.create(req.body)

  const populatedUser = await User.findById(user._id)
    .select("-password")
    .populate("department program year division batch")
    .populate("assignedDivisions")

  res.status(201).json({
    success: true,
    data: populatedUser,
  })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  // Don't allow password update through this route
  delete req.body.password

  let user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    })
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("department program year division batch")
    .populate("assignedDivisions")

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    })
  }

  // Soft delete
  user.isActive = false
  await user.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Assign advisor to divisions
// @route   PUT /api/users/:id/assign
// @access  Private/Admin
exports.assignAdvisor = asyncHandler(async (req, res) => {
  const { divisions } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    })
  }

  if (user.role !== "advisor") {
    return res.status(400).json({
      success: false,
      error: "User must be an advisor",
    })
  }

  if (divisions) {
    user.assignedDivisions = Array.isArray(divisions) ? divisions : [divisions]
  }

  await user.save()

  const populatedUser = await User.findById(user._id)
    .select("-password")
    .populate("assignedDivisions")

  res.status(200).json({
    success: true,
    data: populatedUser,
  })
})

