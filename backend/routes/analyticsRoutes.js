const express = require("express")
const router = express.Router()
const { getAnalytics, getClasswiseReport } = require("../controllers/analyticsController")
const { protect } = require("../middleware/auth")

router.get("/", protect, getAnalytics)
router.get("/classwise", protect, getClasswiseReport)

module.exports = router

