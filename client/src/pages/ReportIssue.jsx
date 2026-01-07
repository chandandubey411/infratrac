import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ToastContainer } from "react-toastify";
import { handleSuccess } from "../Utils";
import { useNavigate } from "react-router-dom";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

const categories = ["Garbage", "Water Leak", "Road Safety", "Pothole", "Streetlight", "Other"];

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    image: null,
    latitude: 28.6448,
    longitude: 77.216721,
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🧠 TEXT AI AUTO ANALYSIS
  useEffect(() => {
    if (form.title.length < 5 && form.description.length < 10) return;

    const timer = setTimeout(() => analyzeText(), 700);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  const analyzeText = async () => {
    try {
      setAiLoading(true);
      const res = await fetch("http://localhost:8080/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: form.title, description: form.description })
      });

      const data = await res.json();
      setAiSuggestion(data);
      setForm(p => ({ ...p, category: data.category || p.category }));
    } finally {
      setAiLoading(false);
    }
  };

  // 🧠 IMAGE AI
  const analyzeImage = async (file) => {
    try {
      setAiLoading(true);

      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("http://localhost:8080/api/ai/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const result = await res.json();

      setAiSuggestion(result);
      setForm(p => ({
        ...p,
        title: result.title || p.title,
        description: result.description || p.description,
        category: result.category || p.category
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  setForm(prev => ({ ...prev, image: file }));
  setImagePreview(URL.createObjectURL(file));

  const formData = new FormData();
  formData.append("image", file);

  try {
    setAiLoading(true);

    const res = await fetch("http://localhost:8080/api/ai/image", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setForm(prev => ({
      ...prev,
      title: data.title || "",
      description: data.description || "",
      category: data.category || prev.category
    }));

    setAiSuggestion(data);

  } catch (err) {
    console.error("Image AI failed:", err);
  } finally {
    setAiLoading(false);
  }
};


  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    await fetch("https://cgc-hacathon-backend.onrender.com/api/issues", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    handleSuccess("Issue reported successfully!");
    setTimeout(() => navigate("/user/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">

        <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border" placeholder="Title" />

        <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border" placeholder="Description" />

        {aiLoading && <p className="text-blue-600">🧠 AI analyzing...</p>}

        {aiSuggestion && (
          <div className="p-3 bg-blue-100 rounded">
            <b>AI Category:</b> {aiSuggestion.category}<br/>
            <b>Priority:</b> {aiSuggestion.priority}<br/>
            <b>Suggested Action:</b> {aiSuggestion.suggestedAction}
          </div>
        )}

        <input type="file" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} className="h-32 mt-2 rounded" />}

        <button disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded">
          {submitting ? "Submitting..." : "Submit"}
        </button>

        <div className="h-72 border">
          <MapContainer center={[form.latitude, form.longitude]} zoom={13} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker setLocation={loc => setForm({ ...form, ...loc })} />
            <Marker position={[form.latitude, form.longitude]} />
          </MapContainer>
        </div>

      </form>
      <ToastContainer />
    </div>
  );
}
