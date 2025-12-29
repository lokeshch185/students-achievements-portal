const mongoose = require("mongoose")

const achievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
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

// Indexes for faster queries
achievementSchema.index({ student: 1, status: 1 })
achievementSchema.index({ category: 1 })
achievementSchema.index({ status: 1 })
achievementSchema.index({ date: -1 })
achievementSchema.index({ student: 1, title: 1, date: 1 }) // For duplicate prevention

module.exports = mongoose.model("Achievement", achievementSchema)

