import React, { useEffect, useState } from "react";
import SnailLoader from "../components/Loader";

function Issue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem("loggedInUser");

  useEffect(() => {
    fetch("https://cgc-hacathon-backend.onrender.com/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <SnailLoader />;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome, <span className="text-indigo-600">{user}</span>
        </h1>
        <p className="text-gray-600">
          Here’s a summary of all issues reported in your area.
        </p>
      </div>

      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        Reported Issues
      </h3>

      {/* Horizontal scroll list */}
      <div className="flex overflow-x-auto gap-6 pb-4">
        {issues.map((issue) => (
          <div
            key={issue._id}
            className="bg-white min-w-[350px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            {/* Image section */}
            {issue.imageURL && (
              <div className="relative">
                <img
                  src={
                    issue.imageURL.startsWith("http")
                      ? issue.imageURL
                      : `http://localhost:8080/${issue.imageURL.replace(
                          "\\",
                          "/"
                        )}`
                  }
                  alt={issue.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div className="absolute top-3 left-3 bg-white/80 text-xs font-semibold px-2 py-1 rounded-lg text-gray-800 backdrop-blur">
                  {issue.category}
                </div>
              </div>
            )}

            {/* Info section */}
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {issue.title}
              </h2>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">
                {issue.description}
              </p>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <span className="font-semibold text-sm text-gray-700">
                    Status:
                  </span>{" "}
                  <span
                    className={`font-bold text-sm ${
                      issue.status === "Resolved"
                        ? "text-green-600"
                        : issue.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Issue;
