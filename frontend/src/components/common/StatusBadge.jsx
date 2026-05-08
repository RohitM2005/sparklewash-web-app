import React from "react";

function StatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status?.toLowerCase()) {
      case "active":
      case "success":
      case "completed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
      case "cancelled":
      case "expired":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusStyle()}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;