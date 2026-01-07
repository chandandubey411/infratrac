import React from "react";

const SnailLoader = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-200 font-poppins">
      {/* 🐌 Snail Animation */}
      <div className="text-6xl animate-snail">🐌</div>

      {/* Progress Bar */}
      <div className="w-72 h-8 border-4 border-gray-800 rounded-xl overflow-hidden bg-white my-6">
        <div className="h-full bg-gray-800 animate-progress"></div>
      </div>

      {/* Loading Text */}
      <p className="text-xl text-gray-800 tracking-wide">Loading...</p>
    </div>
  );
};

export default SnailLoader;
