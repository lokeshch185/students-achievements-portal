const express = require("express")
const router = express.Router()
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")

router.route("/").get(protect, getPrograms).post(protect, authorize("admin"), createProgram)

router
  .route("/:id")
  .get(protect, getProgram)
  .put(protect, authorize("admin"), updateProgram)
  .delete(protect, authorize("admin"), deleteProgram)

module.exports = router

