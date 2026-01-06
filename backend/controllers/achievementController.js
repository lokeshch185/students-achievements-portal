const Achievement = require("../models/Achievement")
const File = require("../models/File")
const User = require("../models/User")
const { asyncHandler } = require("../middleware/errorHandler")
const path = require("path")
const puppeteer = require("puppeteer")

// @desc    Get all achievements with filters
// @route   GET /api/achievements
// @access  Private
exports.getAchievements = asyncHandler(async (req, res) => {
  const {
    student,
    status,
    category,
    department,
    program,
    year,
    division,
    batch,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query

  // Build query
  const query = {}

  // Role-based filtering
  if (req.user.role === "student") {
    // For students, include both their own and group achievements where they are a participant
    query.$or = [{ student: req.user._id }, { participants: req.user._id }]
  } else if (req.user.role === "advisor") {
    const students = await User.find({
      $or: [
        { division: { $in: req.user.assignedDivisions } }
      ],
    }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  } else if (req.user.role === "hod") {
    // HOD can see achievements from their department
    if (req.user.department) {
      const students = await User.find({ department: req.user.department }).select("_id")
      query.student = { $in: students.map((s) => s._id) }
    }
  }

  // Apply filters
  if (student) query.student = student
  if (status) query.status = status
  if (category) query.category = category

  // Additional filters for admin/HOD
  if ((req.user.role === "admin" || req.user.role === "hod") && department) {
    const students = await User.find({ department }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  }

  if (program) {
    const students = await User.find({ program }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  }

  if (year) {
    const students = await User.find({ year }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  }

  if (division) {
    const students = await User.find({ division }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  }

  if (batch) {
    const students = await User.find({ batch }).select("_id")
    query.student = { $in: students.map((s) => s._id) }
  }

  // Pagination
  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const startIndex = (pageNum - 1) * limitNum

  // Execute query
  const achievements = await Achievement.find(query)
    .populate("student", "name rollNo email")
    .populate("category", "name code")
    .populate("verifiedBy", "name email")
    .populate("certificate photo")
    .sort(sort)
    .skip(startIndex)
    .limit(limitNum)

  const total = await Achievement.countDocuments(query)

  res.status(200).json({
    success: true,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: achievements,
  })
})

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
exports.getAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate("student", "name rollNo email department program year division batch")
    .populate("participants", "name rollNo email")
    .populate("category", "name code")
    .populate("verifiedBy", "name email")
    .populate("certificate photo")

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  res.status(200).json({
    success: true,
    data: achievement,
  })
})

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private/Student
exports.createAchievement = asyncHandler(async (req, res) => {
  const { title, category, description, date, academicYear, semester, type = "solo", participants = [] } = req.body

  // Check for duplicate (same title and date)
  const duplicate = await Achievement.findOne({
    student: req.user._id,
    title,
    date: new Date(date),
  })

  if (duplicate) {
    return res.status(400).json({
      success: false,
      error: "An achievement with the same title and date already exists",
    })
  }

  // Handle file uploads
  let certificateFile = null
  let photoFile = null

  if (req.files?.certificate) {
    const file = req.files.certificate[0]
    certificateFile = await File.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user._id,
      fileType: "certificate",
    })
  }

  if (req.files?.photo) {
    const file = req.files.photo[0]
    photoFile = await File.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user._id,
      fileType: "photo",
    })
  }

  // Normalise participants to array of ObjectId strings
  let participantIds = []
  if (Array.isArray(participants)) {
    participantIds = participants
  } else if (participants) {
    // Support single value from form-encoded body
    participantIds = [participants]
  }

  // Build full member list (creator + selected participants), ensure uniqueness
  const membersSet = new Set([req.user._id.toString(), ...participantIds.map((id) => id.toString())])
  const memberIds = Array.from(membersSet)

  // Create one achievement document per member so it appears in each student's list
  const createdAchievements = []

  for (const memberId of memberIds) {
    const achievement = await Achievement.create({
      student: memberId,
      type: memberIds.length > 1 ? "group" : "solo",
      participants: memberIds,
      title,
      category,
      description,
      date,
      certificate: certificateFile?._id,
      photo: photoFile?._id,
      academicYear,
      semester,
    })
    createdAchievements.push(achievement)
  }

  // Return the creator's achievement (first element corresponds to req.user._id)
  const creatorAchievement = createdAchievements.find(
    (a) => a.student.toString() === req.user._id.toString()
  ) || createdAchievements[0]

  const populatedAchievement = await Achievement.findById(creatorAchievement._id)
    .populate("student", "name rollNo email")
    .populate("participants", "name rollNo email")
    .populate("category", "name code")
    .populate("certificate photo")

  res.status(201).json({
    success: true,
    data: populatedAchievement,
  })
})

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private
exports.updateAchievement = asyncHandler(async (req, res) => {
  let achievement = await Achievement.findById(req.params.id)

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  // Only student can update their own pending or rejected achievements
  if (req.user.role === "student") {
    if (achievement.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this achievement",
      })
    }
    if (!["pending", "rejected"].includes(achievement.status)) {
      return res.status(400).json({
        success: false,
        error: "Can only update pending or rejected achievements",
      })
    }
  }

  // Handle file uploads
  if (req.files?.certificate) {
    // Delete old certificate if exists
    if (achievement.certificate) {
      const oldFile = await File.findById(achievement.certificate)
      if (oldFile) {
        const fs = require("fs")
        if (fs.existsSync(oldFile.path)) {
          fs.unlinkSync(oldFile.path)
        }
        await File.findByIdAndDelete(oldFile._id)
      }
    }

    const file = req.files.certificate[0]
    const certificateFile = await File.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user._id,
      fileType: "certificate",
    })
    req.body.certificate = certificateFile._id
  }

  if (req.files?.photo) {
    // Delete old photo if exists
    if (achievement.photo) {
      const oldFile = await File.findById(achievement.photo)
      if (oldFile) {
        const fs = require("fs")
        if (fs.existsSync(oldFile.path)) {
          fs.unlinkSync(oldFile.path)
        }
        await File.findByIdAndDelete(oldFile._id)
      }
    }

    const file = req.files.photo[0]
    const photoFile = await File.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user._id,
      fileType: "photo",
    })
    req.body.photo = photoFile._id
  }

  achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  // If the achievement was previously rejected and the student edited it,
  // move it back to pending and clear verification fields.
  if (req.user.role === "student" && achievement.status === "rejected") {
    achievement.status = "pending"
    achievement.verifiedBy = undefined
    achievement.verifiedDate = undefined
    achievement.rejectionReason = undefined
    await achievement.save()
  }

  achievement = await Achievement.findById(achievement._id)
    .populate("student", "name rollNo email")
    .populate("participants", "name rollNo email")
    .populate("category", "name code")
    .populate("certificate photo")

  res.status(200).json({
    success: true,
    data: achievement,
  })
})

// @desc    Verify achievement
// @route   PUT /api/achievements/:id/verify
// @access  Private/Advisor/HOD
exports.verifyAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("student")

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  // Check authorization
  if (req.user.role === "advisor") {
    const student = await User.findById(achievement.student._id)
    const hasDivisionAccess =
      student.division && req.user.assignedDivisions.some((div) => div.toString() === student.division.toString())
    if (!hasDivisionAccess) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to verify this achievement",
      })
    }
  }

  achievement.status = "verified"
  achievement.verifiedBy = req.user._id
  achievement.verifiedDate = new Date()
   // Clear any previous rejection reason when achievement is verified again
  achievement.rejectionReason = undefined

  await achievement.save()

  const populatedAchievement = await Achievement.findById(achievement._id)
    .populate("student", "name rollNo email")
    .populate("category", "name code")
    .populate("verifiedBy", "name email")
    .populate("certificate photo")

  res.status(200).json({
    success: true,
    data: populatedAchievement,
  })
})

// @desc    Download achievement as PDF (title, description, certificate, photos)
// @route   GET /api/achievements/:id/pdf
// @access  Private/HOD/Advisor/Admin
exports.downloadAchievementPdf = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate("student", "name rollNo email department program year division batch")
    .populate("participants", "name rollNo email")
    .populate("category", "name code")
    .populate("certificate photo")

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  // Authorization: allow admin; HOD limited to their department; advisor to their divisions
  if (req.user.role === "hod") {
    if (
      !achievement.student.department ||
      achievement.student.department.toString() !== req.user.department.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to download this achievement",
      })
    }
  }

  // Build file URLs (served by /api/files/:id)
  const baseUrl = `${req.protocol}://${req.get("host")}`
  const certificateUrl = achievement.certificate ? `${baseUrl}/api/files/${achievement.certificate._id || achievement.certificate}` : null
  const photoUrl = achievement.photo ? `${baseUrl}/api/files/${achievement.photo._id || achievement.photo}` : null

  // Simple HTML template for PDF
  const participants =
    achievement.participants && achievement.participants.length > 0
      ? achievement.participants
      : []

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Achievement - ${achievement.title}</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; color: #111827; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
          p { font-size: 14px; line-height: 1.5; }
          .meta { font-size: 12px; color: #4b5563; margin-bottom: 16px; }
          .section { margin-bottom: 16px; }
          .label { font-weight: 600; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-top: 4px; }
          img { max-width: 100%; max-height: 500px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>${achievement.title}</h1>
        <div class="meta">
          <div><span class="label">Student:</span> ${achievement.student?.name || ""} (${achievement.student?.rollNo || achievement.student?.email || ""})</div>
          <div><span class="label">Category:</span> ${achievement.category?.name || ""}</div>
          <div><span class="label">Date:</span> ${new Date(achievement.date).toLocaleDateString()}</div>
        </div>

        ${
          participants.length
            ? `<div class="section">
                <h2>Group Members</h2>
                <div class="card">
                  ${participants
                    .map(
                      (p) =>
                        `<div>${p.name || ""} ${p.rollNo ? `(${p.rollNo})` : p.email ? `(${p.email})` : ""}</div>`
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }

        <div class="section">
          <h2>Description</h2>
          <div class="card">
            <p>${(achievement.description || "").replace(/\n/g, "<br/>")}</p>
          </div>
        </div>

        ${
          certificateUrl
            ? `<div class="section">
                <h2>Certificate</h2>
                <div class="card">
                  <img src="${certificateUrl}" alt="Certificate" />
                </div>
              </div>`
            : ""
        }

        ${
          photoUrl
            ? `<div class="section">
                <h2>Photo</h2>
                <div class="card">
                  <img src="${photoUrl}" alt="Achievement Photo" />
                </div>
              </div>`
            : ""
        }
      </body>
    </html>
  `

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    })

    const safeTitle = achievement.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase()
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle || "achievement"}.pdf"`)
    res.send(pdfBuffer)
  } finally {
    await browser.close()
  }
})

// @desc    Reject achievement
// @route   PUT /api/achievements/:id/reject
// @access  Private/Advisor/HOD
exports.rejectAchievement = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body

  const achievement = await Achievement.findById(req.params.id).populate("student")

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  // Check authorization
  if (req.user.role === "advisor") {
    const student = await User.findById(achievement.student._id)
    const hasDivisionAccess =
      student.division && req.user.assignedDivisions.some((div) => div.toString() === student.division.toString())
    if (!hasDivisionAccess) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to reject this achievement",
      })
    }
  }

  achievement.status = "rejected"
  achievement.verifiedBy = req.user._id
  achievement.verifiedDate = new Date()
  achievement.rejectionReason = rejectionReason

  await achievement.save()

  res.status(200).json({
    success: true,
    data: achievement,
  })
})

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin/HOD/Student
exports.deleteAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("student")

  if (!achievement) {
    return res.status(404).json({
      success: false,
      error: "Achievement not found",
    })
  }

  // Check authorization
  if (req.user.role === "student") {
    // Students can only delete their own pending achievements
    if (achievement.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this achievement",
      })
    }
    if (achievement.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Can only delete pending achievements",
      })
    }
  } else if (req.user.role === "hod") {
    // HOD can delete achievements from their department
    const student = await User.findById(achievement.student._id)
    if (!student || student.department.toString() !== req.user.department.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this achievement",
      })
    }
  } else if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Not authorized to delete achievements",
    })
  }

  // Delete associated files from disk and database
  const fs = require("fs")
  
  if (achievement.certificate) {
    const file = await File.findById(achievement.certificate)
    if (file) {
      // Delete file from disk
      const filePath = path.resolve(file.path)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (err) {
          console.error("Error deleting certificate file:", err)
        }
      }
      // Delete file record from database
      await File.findByIdAndDelete(achievement.certificate)
    }
  }

  if (achievement.photo) {
    const file = await File.findById(achievement.photo)
    if (file) {
      // Delete file from disk
      const filePath = path.resolve(file.path)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (err) {
          console.error("Error deleting photo file:", err)
        }
      }
      // Delete file record from database
      await File.findByIdAndDelete(achievement.photo)
    }
  }

  // Delete achievement
  await Achievement.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    data: {},
  })
})

