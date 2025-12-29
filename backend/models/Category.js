const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Category code is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
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

module.exports = mongoose.model("Category", categorySchema)

