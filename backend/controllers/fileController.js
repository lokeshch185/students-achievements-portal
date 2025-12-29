const File = require("../models/File")
const path = require("path")
const fs = require("fs")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Get file
// @route   GET /api/files/:id
// @access  Private
exports.getFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id)

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "File not found",
    })
  }

  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
    return res.status(404).json({
      success: false,
      error: "File not found on server",
    })
  }

  // Send file
  res.sendFile(path.resolve(file.path))
})

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id)

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "File not found",
    })
  }

  // Check authorization (only owner or admin can delete)
  if (req.user.role !== "admin" && file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: "Not authorized to delete this file",
    })
  }

  // Delete file from disk
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path)
  }

  // Delete from database
  await File.findByIdAndDelete(file._id)

  res.status(200).json({
    success: true,
    data: {},
  })
})

