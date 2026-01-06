const express = require("express")
const router = express.Router()
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignAdvisor,
} = require("../controllers/userController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const multer = require("multer")
const path = require("path")

// Simple CSV upload configuration
const csvUpload = multer({
  dest: path.join(__dirname, "../uploads/csv"),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"), false)
    }
  },
})

const { bulkCreateStudents } = require("../controllers/userController")

router.route("/").get(protect, authorize("admin"), getUsers).post(protect, authorize("admin"), createUser)
router.post(
  "/bulk",
  protect,
  authorize("admin"),
  csvUpload.single("file"),
  bulkCreateStudents
)

router
  .route("/:id")
  .get(protect, getUser)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser)

router.put("/:id/assign", protect, authorize("admin"), assignAdvisor)

module.exports = router

