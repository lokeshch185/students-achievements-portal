const express = require("express")
const router = express.Router()
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")

router.route("/").get(protect, getDepartments).post(protect, authorize("admin"), createDepartment)

router
  .route("/:id")
  .get(protect, getDepartment)
  .put(protect, authorize("admin"), updateDepartment)
  .delete(protect, authorize("admin"), deleteDepartment)

module.exports = router

