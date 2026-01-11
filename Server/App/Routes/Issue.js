// const express = require("express");
// const router = express.Router();
// const { auth } = require("../Middleware/auth");
// const upload = require("../Middleware/upload");

// const {
//   createIssue,
//   getIssues,
//   getUserIssues
// } = require("../Controller/IssueController");

// // 🆕 Create Issue with Cloudinary upload
// router.post("/", auth, upload.single("image"), createIssue);

// // 📦 Fetch all issues
// router.get("/", getIssues);

// // 👤 Fetch logged-in user's issues
// router.get("/my", auth, getUserIssues);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");

const {
  createIssue,
  getIssues,
  getUserIssues
} = require("../Controller/IssueController");

// 🆕 Create Issue (image is already a URL)
router.post("/", auth, createIssue);

// 📦 Fetch all issues
router.get("/", getIssues);

// 👤 Fetch logged-in user's issues
router.get("/my", auth, getUserIssues);

module.exports = router;
