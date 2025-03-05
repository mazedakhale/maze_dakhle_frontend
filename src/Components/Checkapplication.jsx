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
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/fetch/${userId}/${applicationId}`
      );
      setDocument(response.data);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("No document found for this Application ID.");
    }
  };

  return (
    <div className="ml-[290px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      {/* Search Bar */}
      <h2 className="mt-0 mb-5 text-2xl font-bold">Search Application</h2>
      <div className="w-full max-w-lg bg-white p-4 shadow-md flex items-center rounded-lg">
        <input
          type="text"
          placeholder="Enter Application ID..."
          value={applicationId}
          onChange={(e) => {
            setApplicationId(e.target.value);
            setDocument(null); // Hide details on new input
            setError("");
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-orange-600 text-white px-4 py-2 rounded-r"
        >
          <FaSearch size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Document Details */}
      {document && (
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">
            Application Details
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-2 border-b">
              <strong>Application ID:</strong> {document.application_id}
            </div>
            <div className="p-2 border-b">
              <strong>User ID:</strong> {document.user_id}
            </div>
            <div className="p-2 border-b">
              <strong>Name:</strong> {document.name}
            </div>
            <div className="p-2 border-b">
              <strong>Email:</strong> {document.email}
            </div>
            <div className="p-2 border-b">
              <strong>Phone:</strong> {document.phone}
            </div>
            <div className="p-2 border-b">
              <strong>Address:</strong> {document.address}
            </div>
            <div className="p-2 border-b">
              <strong>Category:</strong> {document.category_name}
            </div>
            <div className="p-2 border-b">
              <strong>Subcategory:</strong> {document.subcategory_name}
            </div>
            <div className="p-2 border-b">
              <strong>Status:</strong> {document.status}
            </div>
            <div className="p-2 border-b">
              <strong>Uploaded At:</strong>{" "}
              {new Date(document.uploaded_at).toLocaleString()}
            </div>
          </div>

          {/* Document Fields */}
          <h3 className="mt-4 text-lg font-bold">Document Fields</h3>
          <div className="bg-gray-100 p-3 rounded">
            {Object.entries(document.document_fields).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>

          {/* Uploaded Documents */}
          <h3 className="mt-4 text-lg font-bold">Uploaded Documents</h3>
          <ul className="list-disc mt-3 list-inside">
            {document.documents.map((doc, index) => (
              <li key={index} className="flex items-center gap-2">
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  <FaFileAlt size={20} />
                </a>
                {/* <span>{doc.document_names}</span> */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchApplication;
