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



/* 📍 Fixed Center Pin */
const CenterPin = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
    <img
      src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
      alt="pin"
      className="w-8 h-8 -translate-y-4"
    />
  </div>
);

/* 🧭 Update form when map moves */
function MapCenterUpdater({ setForm }) {
  const map = useMapEvents({
    moveend: async () => {
      const center = map.getCenter();
      const lat = center.lat;
      const lng = center.lng;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address: data.display_name || "",
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",
        state: data.address?.state || "",
      }));
    },
  });

  return null;
}


/* 🔹 Leaflet marker fix */
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* 🗺️ Map click handler */
function LocationPicker({ setForm }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address: data.display_name || "",
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",
        state: data.address?.state || "",
      }));
    },
  });
  return null;
}

const categories = [
  "Garbage",
  "Water Leak",
  "Road Safety",
  "Pothole",
  "Streetlight",
  "Other",
];

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    image: null,
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* 📍 Live GPS Location */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address: data.display_name || "",
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",
        state: data.address?.state || "",
      }));
    });
  }, []);

  /* 🧹 Image preview cleanup */
  useEffect(
    () => () => imagePreview && URL.revokeObjectURL(imagePreview),
    [imagePreview]
  );

  /* 🧠 AI Text Analysis */
  useEffect(() => {
    if (form.title.length < 5 && form.description.length < 10) return;
    const timer = setTimeout(() => analyzeText(), 700);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  const analyzeText = async () => {
    if (aiLoading || !token) return;
    try {
      setAiLoading(true);
      const res = await fetch(
        "https://civic-issue-portal-2.onrender.com/api/ai/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
          }),
        }
      );
      const data = await res.json();
      setAiSuggestion(data);
      setForm((p) => ({ ...p, category: data.category || p.category }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("image", file);

    try {
      setAiLoading(true);
      const res = await fetch(
        "https://civic-issue-portal-2.onrender.com/api/ai/image",
        {
          method: "POST",
          body: fd,
        }
      );
      const data = await res.json();
      setForm((p) => ({
        ...p,
        title: data.title || p.title,
        description: data.description || p.description,
        category: data.category || p.category,
      }));
      setAiSuggestion(data);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Validation layer (MAIN FIX)
    if (!token) return handleSuccess("Please login first");
    if (!form.title.trim()) return handleSuccess("Please enter issue title");
    if (!form.description.trim())
      return handleSuccess("Please enter issue description");

    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      const res = await fetch(
        "https://civic-issue-portal-2.onrender.com/api/issues",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      handleSuccess("Issue reported successfully!");
      setTimeout(() => navigate("/user/dashboard"), 1000);
    } catch {
      handleSuccess("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          🚨 Report Civic Issue
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Live AI + GPS enabled reporting system
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="section-title">Issue Title</p>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Eg: Garbage near main road"
            />
          </div>

          <div>
            <p className="section-title">Describe Issue</p>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="Explain problem clearly..."
            />
          </div>

          {/* 🏙️ City / State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="section-title">City</p>
              <input value={form.city} readOnly className="input bg-gray-100" />
            </div>
            <div>
              <p className="section-title">State</p>
              <input value={form.state} readOnly className="input bg-gray-100" />
            </div>
          </div>

          <div>
            <p className="section-title">Detected Location</p>
            <input value={form.address} readOnly className="input bg-gray-100" />
          </div>

          <div>
            <p className="section-title">Upload Photo</p>
            <input
              type="file"
              onChange={handleImageChange}
              className="block w-full text-sm file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded file:border-0 file:cursor-pointer"
            />
          </div>

          {imagePreview && (
            <img
              src={imagePreview}
              className="h-40 w-full object-cover rounded-lg border"
              alt="preview"
            />
          )}

          {/* 🗺️ MAP */}
          {/* 🗺️ MAP */}
        <div>
          <p className="section-title">Confirm Location on Map</p>

          <div className="relative h-72 rounded-lg overflow-hidden border">
            {form.latitude && form.longitude && (
              <>
                <MapContainer
                  center={[Number(form.latitude), Number(form.longitude)]}
                  zoom={16}
                  scrollWheelZoom
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  <MapCenterUpdater setForm={setForm} />
                </MapContainer>

                {/* 📍 FIXED CENTER PIN */}
                <CenterPin />
              </>
            )}
          </div>
        </div>

          <button
            disabled={
              submitting ||
              !form.title.trim() ||
              !form.description.trim()
            }
            className="w-full bg-blue-600 disabled:bg-gray-400 hover:bg-blue-700 transition text-white py-3 rounded-full font-semibold text-lg"
          >
            {submitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
