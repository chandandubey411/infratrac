const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { analyzeImage } = require("../Controller/aiController");
const { auth } = require("../Middleware/auth");

router.post("/image", auth, upload.single("image"), analyzeImage);

module.exports = router;
