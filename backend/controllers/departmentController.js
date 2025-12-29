const Department = require("../models/Department")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).populate("hod", "name email")

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments,
  })
})

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate("hod", "name email")

  if (!department) {
    return res.status(404).json({
      success: false,
      error: "Department not found",
    })
  }

  res.status(200).json({
    success: true,
    data: department,
  })
})

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body)

  res.status(201).json({
    success: true,
    data: department,
  })
})

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res) => {
  let department = await Department.findById(req.params.id)

  if (!department) {
    return res.status(404).json({
      success: false,
      error: "Department not found",
    })
  }

  department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: department,
  })
})

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)

  if (!department) {
    return res.status(404).json({
      success: false,
      error: "Department not found",
    })
  }

  // Soft delete
  department.isActive = false
  await department.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

