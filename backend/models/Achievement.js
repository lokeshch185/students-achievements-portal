const mongoose = require("mongoose")
const User = require("./User")
const Department = require("./Department")
const Program = require("./Program")
const Year = require("./Year")
const Division = require("./Division")
const Batch = require("./Batch")

const achievementSchema = new mongoose.Schema(
  {
    // Primary owner/creator of the achievement
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    
    // Solo vs group achievement
    type: {
      type: String,
      enum: ["solo", "group"],
      default: "solo",
    },
    // Other students involved in the achievement (including or excluding creator)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    // Optional per-participant certificates (one per student)
    participantCertificates: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        certificate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "File",
          required: true,
        },
      },
    ],

    academicYear: {
      type: String, // e.g., "2024-2025"
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
  },
  {
    timestamps: true,
  }
)

// Snapshot of student's academic details at the time of approval
achievementSchema.add({
  studentSnapshot: {
    rollNo: String,
    name: String,
    department: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      code: String,
    },
    program: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      code: String,
    },
    year: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      code: String,
      academicYear: String,
      semester: Number,
    },
    division: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      code: String,
    },
    batch: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
  },
  participantSnapshots: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      snapshot: {
        rollNo: String,
        name: String,
        department: {
          id: mongoose.Schema.Types.ObjectId,
          name: String,
          code: String,
        },
        program: {
          id: mongoose.Schema.Types.ObjectId,
          name: String,
          code: String,
        },
        year: {
          id: mongoose.Schema.Types.ObjectId,
          name: String,
          code: String,
          academicYear: String,
          semester: Number,
        },
        division: {
          id: mongoose.Schema.Types.ObjectId,
          name: String,
          code: String,
        },
        batch: {
          id: mongoose.Schema.Types.ObjectId,
          name: String,
        },
      },
    },
  ],
})

// When an achievement is approved, capture the student's academic snapshot
achievementSchema.pre("save", async function (next) {
  const isNewVerified = this.isNew && this.status === "verified"
  const becameVerified = this.isModified("status") && this.status === "verified"

  if (!isNewVerified && !becameVerified) return next()

  try {
    const student = await User.findById(this.student)
      .select("name rollNo department program year division batch")
      .lean()

    if (!student) return next(new Error("Student not found for achievement snapshot"))

    const [department, program, year, division, batch] = await Promise.all([
      student.department ? Department.findById(student.department).lean() : null,
      student.program ? Program.findById(student.program).lean() : null,
      student.year ? Year.findById(student.year).lean() : null,
      student.division ? Division.findById(student.division).lean() : null,
      student.batch ? Batch.findById(student.batch).lean() : null,
    ])

    this.studentSnapshot = {
      rollNo: student.rollNo || null,
      name: student.name || null,
      department: department
        ? { id: department._id, name: department.name, code: department.code }
        : null,
      program: program
        ? { id: program._id, name: program.name, code: program.code }
        : null,
      year: year
        ? {
            id: year._id,
            name: year.name,
            code: year.code,
            academicYear: year.academicYear || null,
            semester: year.semester || null,
          }
        : null,
      division: division
        ? { id: division._id, name: division.name, code: division.code }
        : null,
      batch: batch ? { id: batch._id, name: batch.name } : null,
    }

    // Capture snapshots for participants as well
    if (Array.isArray(this.participants) && this.participants.length > 0) {
      const participantUsers = await User.find({ _id: { $in: this.participants } })
        .select("name rollNo department program year division batch")
        .lean()

      const participantSnapshots = []

      for (const p of participantUsers) {
        const [pDept, pProg, pYear, pDiv, pBatch] = await Promise.all([
          p.department ? Department.findById(p.department).lean() : null,
          p.program ? Program.findById(p.program).lean() : null,
          p.year ? Year.findById(p.year).lean() : null,
          p.division ? Division.findById(p.division).lean() : null,
          p.batch ? Batch.findById(p.batch).lean() : null,
        ])

        participantSnapshots.push({
          student: p._id,
          snapshot: {
            rollNo: p.rollNo || null,
            name: p.name || null,
            department: pDept
              ? { id: pDept._id, name: pDept.name, code: pDept.code }
              : null,
            program: pProg
              ? { id: pProg._id, name: pProg.name, code: pProg.code }
              : null,
            year: pYear
              ? {
                  id: pYear._id,
                  name: pYear.name,
                  code: pYear.code,
                  academicYear: pYear.academicYear || null,
                  semester: pYear.semester || null,
                }
              : null,
            division: pDiv
              ? { id: pDiv._id, name: pDiv.name, code: pDiv.code }
              : null,
            batch: pBatch ? { id: pBatch._id, name: pBatch.name } : null,
          },
        })
      }

      this.participantSnapshots = participantSnapshots
    } else {
      this.participantSnapshots = []
    }

    next()
  } catch (err) {
    next(err)
  }
})

// Indexes for faster queries
achievementSchema.index({ student: 1, status: 1 })
achievementSchema.index({ participants: 1, status: 1 })
achievementSchema.index({ category: 1 })
achievementSchema.index({ status: 1 })
achievementSchema.index({ date: -1 })
achievementSchema.index({ student: 1, title: 1, date: 1 }) // For duplicate prevention

module.exports = mongoose.model("Achievement", achievementSchema)

