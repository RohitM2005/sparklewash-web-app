import React from "react";

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-xl shadow-lg p-5 sm:p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
        >
          ✕
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;