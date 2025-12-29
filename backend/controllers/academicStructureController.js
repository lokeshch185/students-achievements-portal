const Year = require("../models/Year")
const Division = require("../models/Division")
const Batch = require("../models/Batch")
const { asyncHandler } = require("../middleware/errorHandler")

// ========== YEAR CONTROLLERS ==========
exports.getYears = asyncHandler(async (req, res) => {
  const { program } = req.query
  const query = { isActive: true }

  if (program) {
    query.program = program
  }

  const years = await Year.find(query).populate("program", "name code")

  res.status(200).json({
    success: true,
    count: years.length,
    data: years,
  })
})

exports.getYear = asyncHandler(async (req, res) => {
  const year = await Year.findById(req.params.id).populate("program", "name code")

  if (!year) {
    return res.status(404).json({
      success: false,
      error: "Year not found",
    })
  }

  res.status(200).json({
    success: true,
    data: year,
  })
})

exports.createYear = asyncHandler(async (req, res) => {
  const year = await Year.create(req.body)

  res.status(201).json({
    success: true,
    data: year,
  })
})

exports.updateYear = asyncHandler(async (req, res) => {
  let year = await Year.findById(req.params.id)

  if (!year) {
    return res.status(404).json({
      success: false,
      error: "Year not found",
    })
  }

  year = await Year.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: year,
  })
})

exports.deleteYear = asyncHandler(async (req, res) => {
  const year = await Year.findById(req.params.id)

  if (!year) {
    return res.status(404).json({
      success: false,
      error: "Year not found",
    })
  }

  year.isActive = false
  await year.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// ========== DIVISION CONTROLLERS ==========
exports.getDivisions = asyncHandler(async (req, res) => {
  const { year } = req.query
  const query = { isActive: true }

  if (year) {
    query.year = year
  }

  const divisions = await Division.find(query).populate("year advisor")

  res.status(200).json({
    success: true,
    count: divisions.length,
    data: divisions,
  })
})

exports.getDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id).populate("year advisor", "name email")

  if (!division) {
    return res.status(404).json({
      success: false,
      error: "Division not found",
    })
  }

  res.status(200).json({
    success: true,
    data: division,
  })
})

exports.createDivision = asyncHandler(async (req, res) => {
  const division = await Division.create(req.body)

  res.status(201).json({
    success: true,
    data: division,
  })
})

exports.updateDivision = asyncHandler(async (req, res) => {
  let division = await Division.findById(req.params.id)

  if (!division) {
    return res.status(404).json({
      success: false,
      error: "Division not found",
    })
  }

  division = await Division.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: division,
  })
})

exports.deleteDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id)

  if (!division) {
    return res.status(404).json({
      success: false,
      error: "Division not found",
    })
  }

  division.isActive = false
  await division.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// ========== BATCH CONTROLLERS ==========
exports.getBatches = asyncHandler(async (req, res) => {
  const { division } = req.query
  const query = { isActive: true }

  if (division) {
    query.division = division
  }

  const batches = await Batch.find(query).populate("division", "name")

  res.status(200).json({
    success: true,
    count: batches.length,
    data: batches,
  })
})

exports.getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id).populate("division", "name")

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: "Batch not found",
    })
  }

  res.status(200).json({
    success: true,
    data: batch,
  })
})

exports.createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create(req.body)

  res.status(201).json({
    success: true,
    data: batch,
  })
})

exports.updateBatch = asyncHandler(async (req, res) => {
  let batch = await Batch.findById(req.params.id)

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: "Batch not found",
    })
  }

  batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: batch,
  })
})

exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id)

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: "Batch not found",
    })
  }

  batch.isActive = false
  await batch.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

