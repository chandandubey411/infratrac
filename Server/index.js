const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./App/Config/db.js");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// const chatbotRoutes = require("./App/Routes/chatbotRoutes");
const chatbotRoutes = require("./App/Routes/chatbotRoutes");

// const visionRoutes = require("./App/Routes/visionRoutes");
const visionRoutes = require("./App/Routes/visionRoutes");


const authRoutes = require("./App/Routes/auth");
// const authRoutes = require("./App/Routes/auth.js");
const issueRoutes = require("./App/Routes/Issue.js");
const adminRoutes = require("./App/Routes/admin.js");
const aiRoutes = require("./App/Routes/aiRoutes");
const workerRoutes = require("./App/Routes/worker");




connectDB();

app.use(express.urlencoded({ extended: true }));

// 🔥 CORS + JSON (must be before routes)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// 🚏 Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin/issues", adminRoutes);
// app.use("/api/ai", aiRoutes);
app.use("/api/ai", require("./App/Routes/aiRoutes"));


// app.use("/api/vision", visionRoutes);
app.use("/api/vision", visionRoutes);

app.use("/api/worker", workerRoutes); //Worker



app.use("/api/chatbot", chatbotRoutes);

app.get("/ping", (req, res) => res.send("pong"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
