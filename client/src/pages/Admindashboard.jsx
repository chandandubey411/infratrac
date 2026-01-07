import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CityHeatmap from "../components/CityHeatmap";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
const CATEGORIES = ["Garbage", "Water Leak", "Road Safety", "Pothole", "Streetlight", "Other"];
const SORT_OPTIONS = [
  { label: "Latest first", value: "latest" },
  { label: "Oldest first", value: "oldest" },
];

const STAFF_OPTIONS = [
  "Public Works Department (PWD)",
  "Municipal Sanitation Team",
  "Water Supply Department",
  "Road Maintenance Division",
  "Streetlight Maintenance Unit",
  "Drainage & Sewage Department",
  "Waste Management Authority",
  "Parks & Horticulture Department",
  "Traffic & Road Safety Cell",
  "Building & Construction Division",
];

const CityIssueMap = ({ issues }) => {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">City Issue Density</h2>

      <MapContainer
        center={[28.6448, 77.216721]}
        zoom={11}
        style={{ height: "420px", width: "100%" }}
        className="rounded-xl shadow"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {issues.map((issue) =>
          issue.location ? (
            <CircleMarker
              key={issue._id}
              center={[
                issue.location.latitude,
                issue.location.longitude,
              ]}
              radius={8}
              pathOptions={{
                color:
                  issue.status === "Resolved"
                    ? "green"
                    : issue.status === "In Progress"
                    ? "orange"
                    : "red",
              }}
            >
              <Popup>
                <b>{issue.title}</b><br />
                {issue.category}<br />
                Status: {issue.status}
              </Popup>
            </CircleMarker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};


const AdminDashboard = () => {
  const [aiTrends, setAiTrends] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [aiIssues, setAiIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
    sort: "latest",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("loggedInUser");
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchData();
    fetchAIPriorityIssues();
    fetchHeatmap(); 
  }, []);

 useEffect(() => {
  if (!token) return;

  const fetchAITrends = async () => {
    try {
      const res = await fetch("https://cgc-hacathon-backend.onrender.com/api/ai/trends", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      console.log("🧠 AI Trends:", data);   // 🔍 Debug proof
      setAiTrends(data);
    } catch (err) {
      console.error("AI Trend fetch failed:", err);
    }
  };

  fetchAITrends();
}, [token]);



  const fetchData = async () => {
    const res = await fetch("https://cgc-hacathon-backend.onrender.com/api/issues", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAllIssues(data);
    setIssues(data);
    setLoading(false);
  };

    const fetchHeatmap = async () => {
      const res = await fetch("http://localhost:8080/api/admin/issues/heatmap", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHeatmapPoints(data);
    };


  const fetchAIPriorityIssues = async () => {
    const res = await fetch("http://localhost:8080/api/admin/issues/ai-priority", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAiIssues(data.slice(0, 6));
  };

  useEffect(() => {
    let filtered = [...allIssues];

    if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
    if (filters.category) filtered = filtered.filter(i => i.category === filters.category);
    if (filters.search)
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(filters.search.toLowerCase())
      );

    filtered.sort((a, b) =>
      filters.sort === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    setIssues(filtered);
  }, [filters, allIssues]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const startEdit = (issue) => {
    setEditing(issue._id);
    setResolutionNotes(issue.resolutionNotes || "");
    setStatus(issue.status);
    setAssignedTo(issue.assignedTo || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setResolutionNotes("");
    setStatus("");
    setAssignedTo("");
  };

  const saveChanges = async (id) => {
    const res = await fetch(`https://cgc-hacathon-backend.onrender.com/api/admin/issues/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, resolutionNotes, assignedTo }),
    });

    const updatedIssue = await res.json();

    setAllIssues(prev => prev.map(i => i._id === id ? updatedIssue : i));
    cancelEdit();
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Delete this issue?")) return;

    await fetch(`https://cgc-hacathon-backend.onrender.com/api/admin/issues/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setAllIssues(prev => prev.filter(i => i._id !== id));
  };

  if (loading) return <p className="text-center mt-20">Loading dashboard...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">{name} ({email})</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* 🧠 AI Critical Panel */}
      <div className="mb-6 p-4 bg-red-50 border rounded-xl">
        <h2 className="text-xl font-bold text-red-700 mb-3">🚨 AI Critical Issues</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {aiIssues.map(issue => (
            <div key={issue._id} className="p-3 bg-white rounded shadow">
              <p className="font-semibold">{issue.title}</p>
              <p className="text-sm">Category: {issue.category}</p>
              <p className="text-sm font-bold text-red-600">Priority: {issue.priority}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow text-center">
          <p className="text-2xl font-bold">{allIssues.length}</p>
          <p>Total Issues</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded shadow text-center">
          <p className="text-2xl font-bold">{allIssues.filter(i => i.status !== "Resolved").length}</p>
          <p>Open Issues</p>
        </div>
        <div className="p-4 bg-green-50 rounded shadow text-center">
          <p className="text-2xl font-bold">{allIssues.filter(i => i.status === "Resolved").length}</p>
          <p>Resolved</p>
        </div>
        <div className="p-4 bg-red-50 rounded shadow text-center">
          <p className="text-2xl font-bold">{aiIssues.filter(i => i.priority === "High").length}</p>
          <p>High Priority</p>
        </div>
      </div>


      {aiTrends && (
  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md mb-6">
    <h3 className="text-xl font-bold text-indigo-700 mb-3">🧠 AI Trend Insights</h3>

    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">Most Reported Category</p>
        <p className="text-lg font-semibold text-indigo-700">
          {aiTrends.mostReportedCategory}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">Open Issues</p>
        <p className="text-lg font-semibold text-red-600">
          {aiTrends.openIssues}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">Resolved Issues</p>
        <p className="text-lg font-semibold text-green-600">
          {aiTrends.resolvedIssues}
        </p>
      </div>
    </div>
  </div>
)}


      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <select name="status" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>

        <select name="category" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <input type="text" placeholder="Search by title..." value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })} className="border px-3 py-2 rounded flex-1" />
      </div>
          {/* 🗺️ City Heatmap */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">City Issue Density</h2>
        <CityHeatmap points={heatmapPoints} />
      </div> */}


      <CityIssueMap issues={issues} />


      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Category</th>
              <th className="p-2">Status</th>
              <th className="p-2">Resolution</th>
              <th className="p-2">Assigned</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-t">
                <td className="p-2">{issue.title}</td>
                <td className="p-2">{issue.category}</td>

                <td className="p-2">
                  {editing === issue._id ? (
                    <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded">
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={
                      issue.status === "Resolved" ? "text-green-600 font-semibold" :
                      issue.status === "In Progress" ? "text-yellow-600 font-semibold" :
                      "text-red-600 font-semibold"
                    }>
                      {issue.status}
                    </span>
                  )}
                </td>

                <td className="p-2">
                  {editing === issue._id ? (
                    <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} className="border rounded w-full" />
                  ) : issue.resolutionNotes || "-"}
                </td>

                <td className="p-2">
                  {editing === issue._id ? (
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="border rounded">
                      <option value="">Select staff...</option>
                      {STAFF_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : issue.assignedTo || "Unassigned"}
                </td>

                <td className="p-2 space-x-2">
                  {editing === issue._id ? (
                    <>
                      <button onClick={() => saveChanges(issue._id)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(issue)} className="bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                      <button onClick={() => deleteIssue(issue._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;
