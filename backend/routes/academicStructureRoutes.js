const express = require("express")
const router = express.Router()
const {
  getYears,
  getYear,
  createYear,
  updateYear,
  deleteYear,
  getDivisions,
  getDivision,
  createDivision,
  updateDivision,
  deleteDivision,
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
} = require("../controllers/academicStructureController")
const { protect } = require("../middleware/auth")
const { authorize } = require("../middleware/authorize")

// Year routes
router.route("/years").get(protect, getYears).post(protect, authorize("admin"), createYear)
router
  .route("/years/:id")
  .get(protect, getYear)
  .put(protect, authorize("admin"), updateYear)
  .delete(protect, authorize("admin"), deleteYear)

// Division routes
router.route("/divisions").get(protect, getDivisions).post(protect, authorize("admin"), createDivision)
router
  .route("/divisions/:id")
  .get(protect, getDivision)
  .put(protect, authorize("admin"), updateDivision)
  .delete(protect, authorize("admin"), deleteDivision)

// Batch routes
router.route("/batches").get(protect, getBatches).post(protect, authorize("admin"), createBatch)
router
  .route("/batches/:id")
  .get(protect, getBatch)
  .put(protect, authorize("admin"), updateBatch)
  .delete(protect, authorize("admin"), deleteBatch)

module.exports = router

