const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const base64 = fs.readFileSync(req.file.path, "base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a strict municipal issue detection system.
You must ONLY describe what is clearly visible in the image.
Do NOT guess.
If uncertain, choose the closest matching category.
`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
TASK:
Detect the primary civic issue from the image.

ALLOWED CATEGORIES:
Garbage, Pothole, Water Leak, Streetlight, Road Safety, Other

RULES:
1. Title must be 2–6 words and match the category.
2. Description must mention only visible objects.
3. Priority = High for garbage piles, potholes, leaks, hazards.
4. Suggested action must match the issue type.

Return ONLY valid JSON:
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
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` }
            }
          ]
        }
      ],
      max_tokens: 600
    });

    const text = response.choices[0].message.content;

    // 🔐 Robust JSON extraction
    let result;
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      result = JSON.parse(text.slice(jsonStart, jsonEnd));
    } catch (e) {
      console.error("JSON parse failed:", text);
      return res.status(500).json({
        title: "Manual Review Required",
        description: "AI could not analyze image reliably.",
        category: "Other",
        priority: "Medium",
        suggestedAction: "Manual verification required"
      });
    }

    res.json(result);

  } catch (err) {
    console.error("VISION ERROR:", err);
    res.status(500).json({
      title: "Manual Review Required",
      description: "AI could not analyze image reliably.",
      category: "Other",
      priority: "Medium",
      suggestedAction: "Manual verification required"
    });
  }
};
