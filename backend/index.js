const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const path = require("path")
const morgan = require("morgan")
require("dotenv").config()
require("./models/dbConnection")

const { errorHandler } = require("./middleware/errorHandler")

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(morgan("dev"))

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/departments", require("./routes/departmentRoutes"))
app.use("/api/programs", require("./routes/programRoutes"))
app.use("/api/academic", require("./routes/academicStructureRoutes"))
app.use("/api/categories", require("./routes/categoryRoutes"))
app.use("/api/achievements", require("./routes/achievementRoutes"))
app.use("/api/users", require("./routes/userRoutes"))
app.use("/api/analytics", require("./routes/analyticsRoutes"))
app.use("/api/files", require("./routes/fileRoutes"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
