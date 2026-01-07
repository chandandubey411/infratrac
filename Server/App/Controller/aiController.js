const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const base64Image = fs.readFileSync(req.file.path, "base64");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { 
              type: "input_text", 
              text: "Detect the main civic issue in this image and respond in JSON with fields: title, description, category, priority, suggestedAction." 
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`
            }
          ]
        }
      ]
    });

    const text = response.output_text;
    console.log("🧠 AI RAW:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const result = JSON.parse(jsonMatch[0]);

    return res.json(result);

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
