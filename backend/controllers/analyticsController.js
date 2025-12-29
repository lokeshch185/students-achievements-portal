const Achievement = require("../models/Achievement")
const User = require("../models/User")
const { asyncHandler } = require("../middleware/errorHandler")

// @desc    Get analytics
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { department, program, year, division, batch } = req.query

  // Build student query based on filters
  let studentQuery = { role: "student", isActive: true }
  if (department) studentQuery.department = department
  if (program) studentQuery.program = program
  if (year) studentQuery.year = year
  if (division) studentQuery.division = division
  if (batch) studentQuery.batch = batch

  // Role-based filtering
  if (req.user.role === "hod" && req.user.department) {
    studentQuery.department = req.user.department
  } else if (req.user.role === "advisor") {
    studentQuery.$or = [
      { division: { $in: req.user.assignedDivisions } },
      { batch: { $in: req.user.assignedBatches } },
    ]
  }

  const students = await User.find(studentQuery).select("_id")
  const studentIds = students.map((s) => s._id)

  // Build achievement query
  const achievementQuery = { student: { $in: studentIds } }

  // Get statistics
  const [
    totalStudents,
    totalAchievements,
    verifiedAchievements,
    pendingAchievements,
    studentsWithAchievements,
  ] = await Promise.all([
    User.countDocuments(studentQuery),
    Achievement.countDocuments(achievementQuery),
    Achievement.countDocuments({ ...achievementQuery, status: "verified" }),
    Achievement.countDocuments({ ...achievementQuery, status: "pending" }),
    Achievement.distinct("student", achievementQuery).then((ids) => ids.length),
  ])

  // Get top categories
  const categoryStats = await Achievement.aggregate([
    { $match: achievementQuery },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $project: {
        category: "$categoryInfo.name",
        count: 1,
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      total_students: totalStudents,
      total_achievements: totalAchievements,
      verified_achievements: verifiedAchievements,
      pending_achievements: pendingAchievements,
      students_with_achievements: studentsWithAchievements,
      top_categories: categoryStats,
    },
  })
})

// @desc    Get class-wise report
// @route   GET /api/analytics/classwise
// @access  Private/HOD
exports.getClasswiseReport = asyncHandler(async (req, res) => {
  const { department, program } = req.query

  // Build base student query
  let studentQuery = { role: "student", isActive: true }
  
  // Role-based filtering
  if (req.user.role === "hod" && req.user.department) {
    studentQuery.department = req.user.department
  } else if (department) {
    studentQuery.department = department
  }
  
  if (program) {
    studentQuery.program = program
  }

  // Get all years for the department/program
  const Year = require("../models/Year")
  const Program = require("../models/Program")
  
  let yearQuery = {}
  if (program) {
    yearQuery.program = program
  } else if (req.user.role === "hod" && req.user.department) {
    const programs = await Program.find({ department: req.user.department }).select("_id")
    yearQuery.program = { $in: programs.map((p) => p._id) }
  }
  
  const years = await Year.find(yearQuery, { isActive: true }).select("_id code name").sort({ code: 1 })
  console.log(years)
  const classwiseData = {}
  
  // Process each year
  for (const year of years) {
    const yearCode = year.code
    const yearName = year.name
    
    // Get students for this year
    const yearStudentQuery = { ...studentQuery, year: year._id }
    const yearStudents = await User.find(yearStudentQuery).select("_id division")
    const yearStudentIds = yearStudents.map((s) => s._id)
    
    // Get achievements for these students
    const yearAchievementQuery = { student: { $in: yearStudentIds } }
    const [totalAchievements, verifiedAchievements] = await Promise.all([
      Achievement.countDocuments(yearAchievementQuery),
      Achievement.countDocuments({ ...yearAchievementQuery, status: "verified" }),
    ])
    
    // Get divisions for this year
    const Division = require("../models/Division")
    const divisions = await Division.find({ year: year._id }).sort({ code: 1 })
    
    const divisionData = []
    
    for (const division of divisions) {
      // Get students in this division
      const divStudentQuery = { ...yearStudentQuery, division: division._id }
      const divStudents = await User.find(divStudentQuery).select("_id")
      const divStudentIds = divStudents.map((s) => s._id)
      
      // Get achievements for division students
      const divAchievementQuery = { student: { $in: divStudentIds } }
      const [divAchievements, divVerified] = await Promise.all([
        Achievement.countDocuments(divAchievementQuery),
        Achievement.countDocuments({ ...divAchievementQuery, status: "verified" }),
      ])
      
      divisionData.push({
        _id: division._id,
        name: division.name,
        code: division.code,
        students: divStudents.length,
        achievements: divAchievements,
        verified: divVerified,
      })
    }
    
    classwiseData[yearCode] = {
      _id: year._id,
      name: yearName,
      code: year.code,
      totalStudents: yearStudents.length,
      totalAchievements,
      verifiedAchievements,
      divisions: divisionData,
    }
  }
  
  res.status(200).json({
    success: true,
    data: classwiseData,
  })
})

