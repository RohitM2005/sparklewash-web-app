import React from "react";

function Loader({ fullScreen = false }) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "py-10"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm sm:text-base text-gray-500">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loader;