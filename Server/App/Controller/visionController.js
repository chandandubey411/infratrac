// const OpenAI = require("openai");

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// exports.analyzeImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     const base64 = req.file.buffer.toString("base64");

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: `
// You are a strict municipal issue detection system.
// You must ONLY describe what is clearly visible in the image.
// Do NOT guess.
// If uncertain, choose the closest matching category.
// `
//         },
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: `
// TASK:
// Detect the primary civic issue from the image.

// ALLOWED CATEGORIES:
// Garbage, Pothole, Water Leak, Streetlight, Road Safety, Other

// RULES:
// 1. Title must be 2–6 words and match the category.
// 2. Description must mention only visible objects.
// 3. Priority = High for garbage piles, potholes, leaks, hazards.
// 4. Suggested action must match the issue type.

// Return ONLY valid JSON:
// {
//  "title": "",
//  "description": "",
//  "category": "",
//  "priority": "Low | Medium | High",
//  "suggestedAction": ""
// }
// `
//             },
//             {
//               type: "image_url",
//               image_url: { url: `data:image/jpeg;base64,${base64}` }
//             }
//           ]
//         }
//       ],
//       max_tokens: 600
//     });

//     const text = response.choices[0].message.content;

//     let result;
//     try {
//       const jsonStart = text.indexOf("{");
//       const jsonEnd = text.lastIndexOf("}") + 1;
//       result = JSON.parse(text.slice(jsonStart, jsonEnd));
//     } catch (e) {
//       console.error("JSON parse failed:", text);
//       return res.status(500).json({
//         title: "Manual Review Required",
//         description: "AI could not analyze image reliably.",
//         category: "Other",
//         priority: "Medium",
//         suggestedAction: "Manual verification required"
//       });
//     }

//     res.json(result);

//   } catch (err) {
//     console.error("VISION ERROR:", err);
//     res.status(500).json({
//       title: "Manual Review Required",
//       description: "AI could not analyze image reliably.",
//       category: "Other",
//       priority: "Medium",
//       suggestedAction: "Manual verification required"
//     });
//   }
// };


const OpenAI = require("openai");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing at runtime");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "civic-issues" },
        (error, result) => error ? reject(error) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const client = getOpenAIClient();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Return ONLY valid JSON in this exact format:

{
  "title": "",
  "description": "",
  "category": "Garbage | Water Leak | Road Safety | Pothole | Streetlight | Other"
}

Write a detailed 250-300 word description based only on what is visible in the image.
`
          },
          { type: "input_image", image_url: uploadResult.secure_url }
        ]
      }]
    });

    const raw = response.output_text || "";
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      console.log("RAW AI RESPONSE:", raw);
      throw new Error("AI did not return valid JSON");
    }

    const parsed = JSON.parse(match[0]);
    parsed.imageUrl = uploadResult.secure_url;

    return res.json(parsed);

  } catch (err) {
    console.error("🔥 AI ERROR FULL:", err);
    return res.status(500).json({ error: "AI failed to analyze image" });
  }
};

