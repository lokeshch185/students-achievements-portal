const mongoose = require("mongoose")
const User = require("../models/User")
const Department = require("../models/Department")
const Program = require("../models/Program")
const Year = require("../models/Year")
const Division = require("../models/Division")
const Batch = require("../models/Batch")
const Category = require("../models/Category")
require("dotenv").config()

const MONGODB_URI = process.env.DB_URL

// Configurable knobs
const ACADEMIC_YEAR = "2024-2025"
const YEAR_DEFS = [
  { code: "fy", name: "First Year", semester: 1 },
  { code: "sy", name: "Second Year", semester: 3 },
  { code: "ty", name: "Third Year", semester: 5 },
  { code: "ly", name: "Fourth Year", semester: 7 },
]
const DIVISION_CODES = ["A", "B", "C", "D"]

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Program.deleteMany({}),
      Year.deleteMany({}),
      Division.deleteMany({}),
      Batch.deleteMany({}),
      Category.deleteMany({}),
    ])

    // Departments (3)
    const departments = await Department.insertMany([
      { code: "COMP", name: "Computer Engineering" },
      { code: "EXTC", name: "Electronics & Telecommunications" },
      { code: "CSE", name: "Computer Science & Engineering" },
    ])

    // Two programs per department (UG/PG)
    const programs = []
    for (const dept of departments) {
      const created = await Program.insertMany([
        { code: "ug", name: "Undergraduate", department: dept._id },
        { code: "pg", name: "Postgraduate", department: dept._id },
      ])
      programs.push(...created)
    }

    // Years + divisions per program
    const programStructures = {}
    for (const program of programs) {
      const yearDocs = []
      const divisionDocs = {}
      for (const yd of YEAR_DEFS) {
        const year = await Year.create({
          code: yd.code,
          name: yd.name,
          academicYear: ACADEMIC_YEAR,
          semester: yd.semester,
          program: program._id,
        })
        yearDocs.push(year)

        divisionDocs[yd.code] = await Division.insertMany(
          DIVISION_CODES.map((divCode) => ({
            code: divCode,
            name: `Division ${divCode.toUpperCase()}`,
            year: year._id,
          }))
        )
      }
      programStructures[program._id] = { years: yearDocs, divisions: divisionDocs }
    }

    // Categories
    await Category.insertMany([
      { code: "technical-competitions", name: "Technical Competitions" },
      { code: "hackathons", name: "Hackathons" },
      { code: "internships", name: "Internships" },
      { code: "certifications", name: "Certifications" },
      { code: "research", name: "Research & Publications" },
      { code: "sports-culture", name: "Sports & Cultural" },
    ])

    // Pick a canonical program/structures for sample users (COMP UG)
    const compDept = departments.find((d) => d.code === "COMP")
    const compUg = programs.find(
      (p) => p.department.toString() === compDept._id.toString() && p.code === "ug"
    )
    const compStructures = programStructures[compUg._id]
    const fyYear = compStructures.years.find((y) => y.code === "fy")
    const fyDivisions = compStructures.divisions["fy"]

    // Users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@spit.ac.in",
      password: "admin123",
      role: "admin",
    })

    const hod = await User.create({
      name: "Dr. Rajesh Kumar",
      email: "hod@spit.ac.in",
      password: "hod123",
      role: "hod",
      department: compDept._id,
    })

    const advisor = await User.create({
      name: "Prof. Priya Singh",
      email: "advisor@spit.ac.in",
      password: "advisor123",
      role: "advisor",
      department: compDept._id,
      program: compUg._id,
      assignedDivisions: fyDivisions.map((d) => d._id), // advisor for FY divs
    })

    const student = await User.create({
      name: "Arjun Sharma",
      email: "student@spit.ac.in",
      password: "student123",
      role: "student",
      rollNo: "FY-A-001",
      department: compDept._id,
      program: compUg._id,
      year: fyYear._id,
      division: fyDivisions[0]._id,
    })

    // Update department HOD
    compDept.hod = hod._id
    await compDept.save()

    console.log("Seed data created successfully!")
    console.log("Admin:", admin.email, "/ admin123")
    console.log("HOD:", hod.email, "/ hod123")
    console.log("Advisor:", advisor.email, "/ advisor123")
    console.log("Student:", student.email, "/ student123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()

