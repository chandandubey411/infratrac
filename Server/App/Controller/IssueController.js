const Issue = require("../Models/Issue.js");

exports.createIssue = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { title, description, category, latitude, longitude, image } = req.body;

    if (!title || !description || !category || !latitude || !longitude || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const issue = new Issue({
      title,
      description,
      category,
      imageURL: image, // 👈 AI upload se aaya hua Cloudinary URL
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      createdBy: req.user.userId,
    });

    await issue.save();

    res.status(201).json({
      message: "Issue reported successfully",
      issue,
    });

  } catch (err) {
    console.error("CREATE ISSUE ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate("createdBy", "name email");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.userId });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status, resolutionNotes } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Issue not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating issue", error: err.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting issue", error: err.message });
  }
};

// 🧠 AI Priority Issues for Admin Dashboard
exports.getAIPriorityIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ priority: -1, createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch AI priority issues",
      error: err.message,
    });
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const issues = await Issue.find({}, "location status category");

    const points = issues.map((i) => ({
      lat: i.location.latitude,
      lng: i.location.longitude,
      weight: i.status === "Resolved" ? 0.3 : 1,
    }));

    res.json(points);
  } catch (err) {
    res.status(500).json({ message: "Heatmap fetch failed" });
  }
};
