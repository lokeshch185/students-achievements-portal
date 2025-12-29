const Program = require("../models/Program")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
exports.getPrograms = asyncHandler(async (req, res) => {
  const { department } = req.query
  const query = { isActive: true }

  if (department) {
    query.department = department
  }

  const programs = await Program.find(query).populate("department", "name code")

  res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  })
})

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Private
exports.getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id).populate("department", "name code")

  if (!program) {
    return res.status(404).json({
      success: false,
      error: "Program not found",
    })
  }

  res.status(200).json({
    success: true,
    data: program,
  })
})

// @desc    Create program
// @route   POST /api/programs
// @access  Private/Admin
exports.createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body)

  res.status(201).json({
    success: true,
    data: program,
  })
})

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private/Admin
exports.updateProgram = asyncHandler(async (req, res) => {
  let program = await Program.findById(req.params.id)

  if (!program) {
    return res.status(404).json({
      success: false,
      error: "Program not found",
    })
  }

  program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: program,
  })
})

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
exports.deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id)

  if (!program) {
    return res.status(404).json({
      success: false,
      error: "Program not found",
    })
  }

  program.isActive = false
  await program.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

