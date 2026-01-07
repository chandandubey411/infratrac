const express = require("express");
const router = express.Router();
const { chatbotReply } = require("../Controller/chatbotController");

router.post("/chat", chatbotReply);

module.exports = router;
