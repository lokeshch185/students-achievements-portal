const mongoose = require("mongoose")

const divisionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Division code is required"],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Division name is required"],
      trim: true,
    },
    year: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Year",
      required: [true, "Year is required"],
    },
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Compound index for unique division per year
divisionSchema.index({ code: 1, year: 1 }, { unique: true })

module.exports = mongoose.model("Division", divisionSchema)

