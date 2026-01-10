// process.on("unhandledRejection", err => {
//   console.error("🔥 UNHANDLED REJECTION:", err);
// });

// process.on("uncaughtException", err => {
//   console.error("💥 UNCAUGHT EXCEPTION:", err);
// });

// const express = require("express");
// const app = express();
// require("dotenv").config();
// const connectDB = require("./App/Config/db");
// const cors = require("cors");

// // 🧠 CORS — single clean config
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://civic-issue-portal-2.onrender.com"
//   ],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
// }));

// app.options("*", cors());

// // 🌐 Body parsers
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // 📦 Routes
// const chatbotRoutes = require("./App/Routes/chatbotRoutes");
// const visionRoutes = require("./App/Routes/visionRoutes");
// const authRoutes = require("./App/Routes/auth");
// const issueRoutes = require("./App/Routes/Issue");
// const adminRoutes = require("./App/Routes/admin");
// const aiRoutes = require("./App/Routes/aiRoutes");
// const workerRoutes = require("./App/Routes/worker");
// const locationRoutes = require("./App/Routes/location");

// // ⚠️ Multer first
// // app.use("/api/ai", visionRoutes);

// // Other routes
// app.use("/api/auth", authRoutes);
// app.use("/api/issues", issueRoutes);
// app.use("/api/admin/issues", adminRoutes);
// // app.use("/api/ai", aiRoutes);
// app.use("/api/worker", workerRoutes);
// app.use("/api/chatbot", chatbotRoutes);
// app.use("/api/location", locationRoutes);
// app.use("/api/ai", aiRoutes);

// app.get("/ping", (req, res) => res.send("pong"));

// const startServer = async () => {
//   await connectDB();
//   const port = process.env.PORT || 8080;
//   app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
// };

// startServer();

pprocess.on("unhandledRejection", err => {
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

// 🧠 CORS — SAFE & STABLE
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://civic-issue-portal-2.onrender.com"
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// 🌐 Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📦 Routes
const authRoutes = require("./App/Routes/auth");
const issueRoutes = require("./App/Routes/Issue");
const adminRoutes = require("./App/Routes/admin");
const workerRoutes = require("./App/Routes/worker");
const chatbotRoutes = require("./App/Routes/chatbotRoutes");
const locationRoutes = require("./App/Routes/location");
const aiRoutes = require("./App/Routes/aiRoutes");
const visionRoutes = require("./App/Routes/visionRoutes");

// 🔌 Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin/issues", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/location", locationRoutes);

// 🧠 AI ROUTES
app.use("/api/ai", aiRoutes);
app.use("/api/vision", visionRoutes);

// 🧪 Health Check
app.get("/ping", (req, res) => res.send("pong"));

// 🚀 Server Boot
const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
