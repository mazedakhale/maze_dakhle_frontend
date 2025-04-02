import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaFileAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const SearchApplication = () => {
  const [userId, setUserId] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation(); // Detects route changes

  // Fetch user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.user_id);
    }
  }, []);

  // Reset fields on route change
  useEffect(() => {
    resetFields();
  }, [location]);

  // Reset function
  const resetFields = () => {
    setApplicationId("");
    setDocument(null);
    setError("");
  };

  // Handle search
  const handleSearch = async () => {
    if (!applicationId) {
      setError("Please enter an Application ID");
      setDocument(null);
      return;
    }

    // Reset previous data
    setDocument(null);
    setError("");

    try {
      const response = await axios.get(
        `  https://mazedakhale.in/api/userdashboard/fetch/${userId}/${applicationId}`
      );
      setDocument(response.data);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("No document found for this Application ID.");
    }
  };

  return (
    <div className="flex flex-col ml-[280px] items-center justify-start min-h-screen pt-20 bg-[#f8f8f8]">
      {/* Heading */}
      <h2 className="mt-0 mb-5 text-2xl font-bold">Search Application</h2>

      {/* Search Bar Container */}
      <div className="w-full max-w-2xl bg-white p-5 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <input
            type="text"
            placeholder="Enter Application ID"
            value={applicationId}
            onChange={(e) => {
              setApplicationId(e.target.value);
              setDocument(null);
              setError("");
            }}
            className="flex-1 px-5 py-3 text-gray-600 bg-transparent rounded-full focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition duration-200"
          >
            <FaSearch size={22} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Document Details */}
      {document && (
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-center">Application Details</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-2 border-b"><strong>Application ID:</strong> {document.application_id}</div>
            <div className="p-2 border-b"><strong>User ID:</strong> {document.user_id}</div>
            <div className="p-2 border-b"><strong>Name:</strong> {document.name}</div>
            <div className="p-2 border-b"><strong>Email:</strong> {document.email}</div>
            <div className="p-2 border-b"><strong>Phone:</strong> {document.phone}</div>
            <div className="p-2 border-b"><strong>Address:</strong> {document.address}</div>
            <div className="p-2 border-b"><strong>Category:</strong> {document.category_name}</div>
            <div className="p-2 border-b"><strong>Subcategory:</strong> {document.subcategory_name}</div>
            <div className="p-2 border-b">
              <strong>Status:</strong> {document.status}
              {/* Latest Status Date and Time */}
              {document.status_history
                ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Sort by latest date
                .slice(0, 1) // Take the first entry (latest status)
                .map((statusEntry, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    {new Date(statusEntry.updated_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit", // Added seconds
                      hour12: true, // Use AM/PM
                    })}
                  </div>
                ))}
            </div>            <div className="p-2 border-b"><strong>Uploaded At:</strong> {new Date(document.uploaded_at).toLocaleString()}</div>
          </div>

          {/* Document Fields */}
          <h3 className="mt-4 text-lg font-bold">Document Fields</h3>
          <div className="bg-gray-100 p-3 rounded">
            {document.document_fields.map((field, index) => (
              <p key={index}>
                <strong>{field.field_name}:</strong> {field.field_value}
              </p>
            ))}
          </div>


          {/* Uploaded Documents */}
          <h3 className="mt-4 text-lg font-bold">Uploaded Documents</h3>
          <ul className="list-disc mt-3 list-inside flex flex-wrap gap-2">
            {document.documents.map((doc, index) => (
              <li key={index} className="flex items-center">
                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center gap-1">
                  <FaFileAlt size={20} />
                  <span>{doc.document_type || `Document ${index + 1}`}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

}

export default SearchApplication;


