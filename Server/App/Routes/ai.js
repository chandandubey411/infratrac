const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { analyzeImage } = require("../Controller/visionController");

router.post("/image", upload.single("image"), analyzeImage);

module.exports = router;
