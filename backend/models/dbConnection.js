const mongoose = require("mongoose")

const MONGODB_URI = process.env.DB_URL || "mongodb://localhost:27017/student-achievement"

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB is Connected...")
  })
  .catch((err) => {
    console.log("Error while mongoDB connection: ", err)
    process.exit(1)
  })

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err)
})