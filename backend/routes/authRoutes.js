const express = require("express")
const router = express.Router()
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
} = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")

router.post("/register", protect, authorize("admin"), register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)

module.exports = router

