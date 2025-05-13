// src/pages/AddCertificateRequestPage.jsx

import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

export default function AddCertificateRequestPage() {
  const navigate = useNavigate();
  const {
    documentId,
    applicationId,
    distributorId,
    userId,
    categoryId,
    subcategoryId,
    name,
    email,
  } = useLocation().state || {};

  const [errorType, setErrorType] = useState("certificate");
  const [description, setDescription] = useState("");
  const [certFile, setCertFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && (f.type === "application/pdf" || f.type.startsWith("image/"))) {
      setCertFile(f);
    } else {
      Swal.fire("Error", "Only PDF or image files allowed.", "error");
      setCertFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !certFile) {
      return Swal.fire("Error", "All fields are required.", "error");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("request_description", description);
    formData.append("file", certFile);
    formData.append("document_id", String(documentId));
    formData.append("application_id", String(applicationId));
    formData.append("distributor_id", String(distributorId));
    formData.append("user_id", String(userId));
    formData.append("category_id", String(categoryId));
    formData.append("subcategory_id", String(subcategoryId));
    formData.append("request_name", String(name));
    formData.append("request_email", String(email));
    formData.append("error_type", errorType); // now dynamic!

    try {
      const resp = await axios.post(
        "https://mazedakhale.in/api/request-errors/create",
        formData
      );
      if (resp.status === 201 || resp.status === 200) {
        Swal.fire("Success", "Error request submitted!", "success");
        navigate("/Customerhistory");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err.message);
      Swal.fire("Error", "Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-[500px]">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Report an Error</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Type Selector */}
          <div>
            <label className="block font-semibold mb-1">
              Select Error Type
            </label>
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="certificate">Certificate</option>
              <option value="receipt">Receipt</option>
              <option value="payment">Payment</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">What’s wrong?</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Describe the issue…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block font-semibold mb-1">
              Upload Relevant File
            </label>
            <input
              type="file"
              accept="application/pdf, image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 text-white rounded ${
              submitting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Submitting…" : "Submit Error Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
