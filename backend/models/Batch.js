const mongoose = require("mongoose")

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      uppercase: true,
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
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

// Compound index for unique batch per division
batchSchema.index({ name: 1, division: 1 }, { unique: true })

module.exports = mongoose.model("Batch", batchSchema)

