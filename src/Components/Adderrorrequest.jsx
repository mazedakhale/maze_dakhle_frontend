import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
      console.log("📂 Selected File:", file.name);
      setErrorDocument(file);
    } else {
      alert("Only PDF or image files are allowed.");
      setErrorDocument(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestDescription || !errorDocument) {
      alert("Please fill all required fields.");
      return;
    }

    // Debugging logs
    console.log("📝 Request Description:", requestDescription);
    console.log("📂 Error Document:", errorDocument.name);
    console.log("📄 Document ID:", documentId);
    console.log("📄 Application ID:", applicationId);
    console.log("📌 Distributor ID:", distributorId);
    console.log("👤 User ID:", userId);
    console.log("📑 Category ID:", categoryId);
    console.log("📂 Subcategory ID:", subcategoryId);
    console.log("📂 Name:", name);
    console.log("📂 Email:", email);

    setUploading(true);

    const formData = new FormData();
    formData.append("request_description", requestDescription);
    formData.append("file", errorDocument); // 🔥 Match with @UploadedFile() in NestJS
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
        "http://localhost:3000/request-errors/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        console.log("✅ Submission Successful:", response.data);
        alert("Error request submitted successfully!");
        navigate("/Customerhistory");
      }
    } catch (error) {
      console.error("❌ Submission Failed:", error.response?.data || error.message);
      alert("Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[500px]">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Error Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Request Description:</label>
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
            <label className="block font-semibold mb-1">Upload Error Document:</label>
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
