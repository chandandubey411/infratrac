const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.chatbotReply = async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ reply: "No message received." });
    }

    const userMessage = req.body.message;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `You are a helpful civic assistant.\nUser: ${userMessage}`,
    });

    const reply = response.output[0].content[0].text;

    res.json({ reply });
  } catch (err) {
    console.error("CHATBOT ERROR:", err);
    res.status(500).json({ reply: "Server crashed." });
  }
};
