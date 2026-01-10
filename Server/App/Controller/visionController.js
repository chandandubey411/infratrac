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


const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// 🧠 Force OpenAI SDK to read env directly
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const OpenAI = require("openai");

// 🧪 Debug: verify key on Render
console.log("OPENAI KEY EXISTS:", process.env.OPENAI_API_KEY ? "YES" : "NO");

// 🧠 OpenAI Client (NO constructor args)
const client = new OpenAI();

// ☁️ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // 📤 Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "civic-issues" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const imageUrl = uploadResult.secure_url;

    // 🧠 OpenAI Vision Call
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Detect the main civic issue and return ONLY strict JSON:
{
 "title": "",
 "description": "",
 "category": "",
 "priority": "Low | Medium | High",
 "suggestedAction": ""
}`
          },
          {
            type: "input_image",
            image_url: imageUrl
          }
        ]
      }]
    });

    // 🔥 Correct parsing for new OpenAI SDK
    const outputText = response.output[0].content[0].text;
    const json = JSON.parse(outputText);

    return res.json(json);

  } catch (err) {
    console.error("🔥 AI IMAGE ERROR FULL:", err);
    return res.status(500).json({
      error: "AI image analysis failed",
      details: err?.message || "Unknown error"
    });
  }
};
