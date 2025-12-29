const mongoose = require("mongoose")

const programSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Program code is required"],
      trim: true,
      enum: ["ug", "pg"],
    },
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    description: {
      type: String,
      trim: true,
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

// Compound index for unique program per department
programSchema.index({ code: 1, department: 1 }, { unique: true })

module.exports = mongoose.model("Program", programSchema)

