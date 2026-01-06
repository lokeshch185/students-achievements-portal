const express = require("express")
const router = express.Router()
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  verifyAchievement,
  rejectAchievement,
  deleteAchievement,
  downloadAchievementPdf,
} = require("../controllers/achievementController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")
const { uploadFiles } = require("../middleware/upload")

router
  .route("/")
  .get(protect, getAchievements)
  .post(protect, authorize("student"), uploadFiles, createAchievement)

router
  .route("/:id")
  .get(protect, getAchievement)
  .put(protect, uploadFiles, updateAchievement)
  .delete(protect, deleteAchievement)

router.put("/:id/verify", protect, authorize("advisor", "hod"), verifyAchievement)
router.put("/:id/reject", protect, authorize("advisor", "hod"), rejectAchievement)
router.get("/:id/pdf", protect, authorize("hod", "admin"), downloadAchievementPdf)

module.exports = router

