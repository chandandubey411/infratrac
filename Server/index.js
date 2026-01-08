process.on("unhandledRejection", err => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", err => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});


const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./App/Config/db.js");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const chatbotRoutes = require("./App/Routes/chatbotRoutes");
const visionRoutes = require("./App/Routes/visionRoutes");
const authRoutes = require("./App/Routes/auth");
const issueRoutes = require("./App/Routes/Issue.js");
const adminRoutes = require("./App/Routes/admin.js");
const aiRoutes = require("./App/Routes/aiRoutes");
const workerRoutes = require("./App/Routes/worker");

// 🌐 Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true
}));

// 📁 Uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// 🚏 Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin/issues", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/ping", (req, res) => res.send("pong"));

// 🚀 Start server only after DB connects
const startServer = async () => {
  await connectDB();

  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
};

startServer();

app.use((err, req, res, next) => {
  console.error("🚨 EXPRESS ERROR:", err);
  res.status(500).json({ error: err.message });
});


