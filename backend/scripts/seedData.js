const mongoose = require("mongoose")
const User = require("../models/User")
const Department = require("../models/Department")
const Program = require("../models/Program")
const Category = require("../models/Category")
require("dotenv").config()

const MONGODB_URI = process.env.DB_URL;

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Department.deleteMany({})
    await Program.deleteMany({})
    await Category.deleteMany({})

    // Create departments
    const compDept = await Department.create({
      code: "COMP",
      name: "Computer Engineering",
    })

    const extcDept = await Department.create({
      code: "EXTC",
      name: "Electronics & Telecommunications",
    })

    const cseDept = await Department.create({
      code: "CSE",
      name: "Computer Science & Engineering",
    })

    // Create programs
    const ugProgram = await Program.create({
      code: "ug",
      name: "Undergraduate",
      department: compDept._id,
    })

    const pgProgram = await Program.create({
      code: "pg",
      name: "Postgraduate",
      department: compDept._id,
    })

    // Create categories
    const categories = await Category.insertMany([
      { code: "technical-competitions", name: "Technical Competitions" },
      { code: "hackathons", name: "Hackathons" },
      { code: "internships", name: "Internships" },
      { code: "certifications", name: "Certifications" },
      { code: "research", name: "Research & Publications" },
      { code: "sports-culture", name: "Sports & Cultural" },
    ])

    // Create users
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
      program: ugProgram._id,
    })

    const student = await User.create({
      name: "Arjun Sharma",
      email: "student@spit.ac.in",
      password: "student123",
      role: "student",
      rollNo: "SE-A-001",
      department: compDept._id,
      program: ugProgram._id,
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

