const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directories exist
const uploadDirs = {
  certificates: path.join(__dirname, "../uploads/certificates"),
  photos: path.join(__dirname, "../uploads/photos"),
}

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    certificate: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    photo: ["image/jpeg", "image/jpg", "image/png"],
  }

  const fileType = req.body.fileType || (file.fieldname === "certificate" ? "certificate" : "photo")
  const allowed = allowedMimes[fileType] || allowedMimes.photo

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowed.join(", ")}`), false)
  }
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.body.fileType || (file.fieldname === "certificate" ? "certificate" : "photo")
    const uploadPath = fileType === "certificate" ? uploadDirs.certificates : uploadDirs.photos
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024, // 10MB
  },
  fileFilter: fileFilter,
})

// Export upload middleware
exports.uploadCertificate = upload.single("certificate")
exports.uploadPhoto = upload.single("photo")
exports.uploadFiles = upload.fields([
  { name: "certificate", maxCount: 1 },
  { name: "photo", maxCount: 1 },
])

