// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
// const CATEGORIES = ["Garbage", "Water Leak", "Road Safety", "Pothole", "Streetlight", "Other"];

// const WorkerDashboard = () => {
//   const [issues, setIssues] = useState([]);
//   const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({ status: "", category: "", search: "" });

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const name = localStorage.getItem("loggedInUser");
//   const email = localStorage.getItem("userEmail");

//   useEffect(() => {
//     fetchIssues();
//     fetchStats();
//   }, []);

//  const fetchIssues = async () => {
//   const res = await fetch("http://localhost:8080/api/worker/issues", {
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`   // 👈 MUST BE EXACT
//     }
//   });

//   const data = await res.json();
//   setIssues(data);
//   setLoading(false);
// };

// const fetchStats = async () => {
//   const res = await fetch("http://localhost:8080/api/worker/stats", {
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`   // 👈 MUST BE EXACT
//     }
//   });

//   const data = await res.json();
//   setStats(data);
// };


//   const updateStatus = async (id, status) => {
//     await fetch(`http://localhost:8080/api/worker/issues/${id}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({ status })
//     });
//     fetchIssues();
//     fetchStats();
//   };

//   const filtered = issues.filter(i => {
//     if (filters.status && i.status !== filters.status) return false;
//     if (filters.category && i.category !== filters.category) return false;
//     if (filters.search && !i.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
//     return true;
//   });

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//     window.location.reload();
//   };

//   if (loading) return <p className="text-center mt-20">Loading dashboard...</p>;

//   return (
//     <div className="max-w-7xl mx-auto p-6 mt-10">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Worker Dashboard</h1>
//           <p className="text-gray-600">{name} ({email})</p>
//         </div>
//         <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
//           Logout
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//         <div className="p-4 bg-white rounded shadow text-center">
//           <p className="text-2xl font-bold">{stats.total}</p>
//           <p>Total Assigned</p>
//         </div>
//         <div className="p-4 bg-yellow-50 rounded shadow text-center">
//           <p className="text-2xl font-bold">{stats.open}</p>
//           <p>Open Issues</p>
//         </div>
//         <div className="p-4 bg-green-50 rounded shadow text-center">
//           <p className="text-2xl font-bold">{stats.resolved}</p>
//           <p>Resolved</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
//         <select className="border px-3 py-2 rounded" onChange={e => setFilters({ ...filters, status: e.target.value })}>
//           <option value="">All statuses</option>
//           {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
//         </select>

//         <select className="border px-3 py-2 rounded" onChange={e => setFilters({ ...filters, category: e.target.value })}>
//           <option value="">All categories</option>
//           {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//         </select>

//         <input
//           className="border px-3 py-2 rounded flex-1"
//           placeholder="Search by title..."
//           onChange={e => setFilters({ ...filters, search: e.target.value })}
//         />
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded shadow overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2">Title</th>
//               <th className="p-2">Category</th>
//               <th className="p-2">Status</th>
//               <th className="p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(issue => (
//               <tr key={issue._id} className="border-t">
//                 <td className="p-2">{issue.title}</td>
//                 <td className="p-2">{issue.category}</td>

//                 <td className={`p-2 font-semibold ${
//                   issue.status === "Resolved" ? "text-green-600" :
//                   issue.status === "In Progress" ? "text-yellow-600" :
//                   "text-red-600"
//                 }`}>
//                   {issue.status}
//                 </td>

//                 <td className="p-2">
//                   <select
//                     value={issue.status}
//                     onChange={e => updateStatus(issue._id, e.target.value)}
//                     className="border rounded px-2 py-1"
//                   >
//                     {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// };

// export default WorkerDashboard;


import React, { useState } from "react";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];

const demoIssues = [
  { _id: 1, title: "Water pipe leak", category: "Water Leak", status: "Pending" },
  { _id: 2, title: "Street light broken", category: "Streetlight", status: "In Progress" },
  { _id: 3, title: "Garbage overflow", category: "Garbage", status: "Resolved" },
];

const WorkerDashboard = () => {
  const [issues, setIssues] = useState(demoIssues);

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status !== "Resolved").length,
    resolved: issues.filter(i => i.status === "Resolved").length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-gray-600">Ravi Kumar (Water Supply Department)</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p>Total Assigned</p>
        </div>
        <div className="bg-yellow-50 p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold">{stats.open}</p>
          <p>Open Issues</p>
        </div>
        <div className="bg-green-50 p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold">{stats.resolved}</p>
          <p>Resolved</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-t">
                <td className="p-3">{issue.title}</td>
                <td className="p-3">{issue.category}</td>
                <td className={`p-3 font-semibold ${
                  issue.status === "Resolved" ? "text-green-600" :
                  issue.status === "In Progress" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {issue.status}
                </td>
                <td className="p-3">
                  <select
                    className="border px-2 py-1 rounded"
                    value={issue.status}
                    onChange={(e) => {
                      const updated = issues.map(i =>
                        i._id === issue._id ? { ...i, status: e.target.value } : i
                      );
                      setIssues(updated);
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default WorkerDashboard;
