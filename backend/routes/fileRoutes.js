const express = require("express")
const router = express.Router()
const { getFile, deleteFile } = require("../controllers/fileController")
const { protect } = require("../middleware/auth")

router.route("/:id").get(protect, getFile).delete(protect, deleteFile)

module.exports = router

