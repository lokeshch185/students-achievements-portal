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

router.route("/").get(protect, authorize("admin"), getUsers).post(protect, authorize("admin"), createUser)

router
  .route("/:id")
  .get(protect, getUser)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser)

router.put("/:id/assign", protect, authorize("admin"), assignAdvisor)

module.exports = router

