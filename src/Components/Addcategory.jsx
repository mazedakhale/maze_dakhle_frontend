import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const AddErrorRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    documentId,
    applicationId,
    distributorId,
    userId,
    categoryId,
    subcategoryId,
    name,
    email,
  } = location.state || {};

  const [requestDescription, setRequestDescription] = useState("");
  const [errorDocument, setErrorDocument] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
      setErrorDocument(file);
    } else {
      alert("Only PDF or image files are allowed.");
      setErrorDocument(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestDescription || !errorDocument) {
      alert("Please fill all required fields.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("request_description", requestDescription);
    formData.append("file", errorDocument);
    formData.append("document_id", String(documentId));
    formData.append("application_id", String(applicationId));
    formData.append("distributor_id", String(distributorId));
    formData.append("user_id", String(userId));
    formData.append("category_id", String(categoryId));
    formData.append("subcategory_id", String(subcategoryId));
    formData.append("request_name", String(name));
    formData.append("request_email", String(email));

    try {
      const response = await axios.post(
        "https://mazedakhale.in/api/request-errors/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 201) {
        alert("Error request submitted successfully!");
        navigate("/Customerhistory");
      }
    } catch (err) {
      console.error("Submission Failed:", err.response?.data || err.message);
      alert("Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">

      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden w-[500px]">
        {/* Header */}

        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Add Error Request
          </h2>
          <button
            onClick={() => navigate("/Customerhistory")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1">
              Request Description:
            </label>
            <textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="Describe the issue..."
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Upload Error Document:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf, image/*"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 text-white rounded ${uploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {uploading ? "Submitting..." : "Submit Error Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddErrorRequestPage;
