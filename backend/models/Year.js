const mongoose = require("mongoose")

const yearSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Year code is required"],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Year name is required"],
      trim: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Program is required"],
    },
    academicYear: {
      type: String, // e.g., "2024-2025"
      trim: true,
    },
    semester: {
      type: Number, // For PG programs: 1, 2, 3, 4
      min: 1,
      max: 8,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique year per program
yearSchema.index({ code: 1, program: 1 }, { unique: true })

module.exports = mongoose.model("Year", yearSchema)

