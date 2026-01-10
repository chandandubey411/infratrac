process.on("unhandledRejection", err => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", err => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});


const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./App/Config/db");
const cors = require("cors");

const chatbotRoutes = require("./App/Routes/chatbotRoutes");
const visionRoutes = require("./App/Routes/visionRoutes");
const authRoutes = require("./App/Routes/auth");
const issueRoutes = require("./App/Routes/Issue");
const adminRoutes = require("./App/Routes/admin");
const aiRoutes = require("./App/Routes/aiRoutes");
const workerRoutes = require("./App/Routes/worker");
const locationRoutes = require("./App/Routes/location");

// ⚠️ Multer routes FIRST
app.use("/api/ai", visionRoutes);

// 🌐 Body parsers AFTER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://civic-issue-portal-2.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());


// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin/issues", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/location", locationRoutes);

app.get("/ping", (req, res) => res.send("pong"));

const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
};

startServer();



