import React from "react";

export default function CustomerDetailsModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Customer Details</h2>
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 border rounded-md hover:bg-slate-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}