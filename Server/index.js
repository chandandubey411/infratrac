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

// 🧠 CORS Config
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://civic-issue-portal-2.onrender.com",
    "https://civic-issue-portal-omega.vercel.app"
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});




// 🌐 Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📦 App Routes
app.use("/api/auth", require("./App/Routes/auth"));
app.use("/api/issues", require("./App/Routes/Issue"));
app.use("/api/admin/issues", require("./App/Routes/admin"));
app.use("/api/worker", require("./App/Routes/worker"));
app.use("/api/chatbot", require("./App/Routes/chatbotRoutes"));
app.use("/api/location", require("./App/Routes/location"));
app.use("/api/ai", require("./App/Routes/aiRoutes"));

// 🧠 Vision Route (correct path)
app.use("/api/vision", require("./App/Routes/visionRoutes"));

// 🧪 Health Check
app.get("/ping", (req, res) => res.send("pong"));

// 🚀 Start Server
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
