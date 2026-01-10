const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageUrl = req.file.path;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Detect the main civic issue in this image.

Return strict JSON:
{
 "title": "",
 "description": "",
 "category": "",
 "priority": "Low | Medium | High",
 "suggestedAction": ""
}
`
            },
            {
              type: "input_image",
              image_url: imageUrl
            }
          ]
        }
      ]
    });

    const text = response.output_text;
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    return res.json(json);

  } catch (err) {
    console.error("🔥 IMAGE AI ERROR:", err);
    return res.status(500).json({
      title: "Manual Review Required",
      description: "AI could not analyze image.",
      category: "Other",
      priority: "Medium",
      suggestedAction: "Manual inspection required"
    });
  }
};
