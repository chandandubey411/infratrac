const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeImage } = require("../Controller/visionController");
const { auth } = require("../Middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/image", auth, upload.single("image"), analyzeImage);

module.exports = router;
