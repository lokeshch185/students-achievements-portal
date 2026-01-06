const User = require("../models/User")
const { asyncHandler } = require("../middleware/errorHandler")
const path = require("path")
const fs = require("fs")
const csv = require("csv-parse/sync")

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
  console.log("users", users)
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

// @desc    Lightweight student search for participant selection
// @route   GET /api/users/students/search
// @access  Private
exports.searchStudents = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query

  if (!q || !q.trim()) {
    return res.status(200).json({
      success: true,
      data: [],
    })
  }

  const limitNum = Math.min(parseInt(limit, 10) || 10, 50)

  const students = await User.find({
    role: "student",
    isActive: true,
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .select("name email") // _id is included by default
    .sort({ name: 1 })
    .limit(limitNum)

  res.status(200).json({
    success: true,
    data: students,
  })
})



// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res) => {
  console.log("user")
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

// @desc    Bulk create student users from CSV
// @route   POST /api/users/bulk
// @access  Private/Admin
exports.bulkCreateStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "CSV file is required",
    })
  }

  const filePath = req.file.path
  let records = []
  try {
    const content = fs.readFileSync(filePath, "utf8")
    records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: "Failed to parse CSV file",
    })
  } finally {
    // Clean up uploaded file
    fs.unlink(filePath, () => {})
  }

  const Department = require("../models/Department")
  const Program = require("../models/Program")
  const Year = require("../models/Year")
  const Division = require("../models/Division")
  const Batch = require("../models/Batch")

  const results = {
    total: records.length,
    successCount: 0,
    failureCount: 0,
    errors: [],
  }

  for (const [index, row] of records.entries()) {
    try {
      const {
        name,
        email,
        password,
        rollNo,
        departmentCode,
        programCode,
        yearCode,
        divisionCode,
        batchCode,
      } = row

      if (!name || !email || !password) {
        throw new Error("Missing required fields: name, email, password")
      }

      // Resolve academic references by code
      const department = departmentCode
        ? await Department.findOne({ code: departmentCode.toLowerCase() })
        : null
      const program = programCode
        ? await Program.findOne({ code: programCode.toLowerCase() })
        : null
      const year = yearCode
        ? await Year.findOne({ code: yearCode.toLowerCase() })
        : null
      const division = divisionCode
        ? await Division.findOne({ code: divisionCode.toUpperCase() })
        : null
      const batch = batchCode
        ? await Batch.findOne({ number: batchCode, division: division?._id })
        : null

      const userData = {
        name,
        email,
        password,
        role: "student",
        rollNo: rollNo || undefined,
        department: department?._id,
        program: program?._id,
        year: year?._id,
        division: division?._id,
        batch: batch?._id,
      }

      await User.create(userData)
      results.successCount += 1
    } catch (err) {
      results.failureCount += 1
      results.errors.push({
        row: index + 2, // account for header row
        message: err.message,
      })
    }
  }

  res.status(200).json({
    success: true,
    data: results,
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

