import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaFileAlt, FaTimes } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Function to format date to dd-mm-yyyy hh:mm:ss AM/PM
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${formattedDate} ${formattedTime}`;
};

const SearchApplication = () => {
  const [userId, setUserId] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // hold a ref to cancel pending requests if input changes quickly
  const cancelTokenRef = useRef();

  // get user id once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.user_id);
    }
  }, []);

  // reset on route change
  useEffect(() => {
    setApplicationId("");
    setDocument(null);
    setError("");
  }, [location]);

  // whenever applicationId changes, auto-search if non-empty
  useEffect(() => {
    // clear out if empty
    if (!applicationId.trim()) {
      setDocument(null);
      setError("");
      return;
    }

    // debounce a tiny bit (300ms) to avoid spamming rapid requests
    const handler = setTimeout(() => {
      // cancel previous
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel();
      }
      cancelTokenRef.current = axios.CancelToken.source();

      axios
        .get(
          `https://mazedakhale.in/api/userdashboard/fetch/${userId}/${applicationId.trim()}`,
          { cancelToken: cancelTokenRef.current.token }
        )
        .then((resp) => {
          setDocument(resp.data);
          setError("");
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            console.error(err);
            setDocument(null);
            setError("No document found for this Application ID.");
          }
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [applicationId, userId]);

  return (
    <div className="flex flex-col ml-[280px] items-center justify-start min-h-screen pt-20 bg-[#f8f8f8]">
      <h2 className="mb-5 text-2xl font-bold">Search Application</h2>

      <div className="w-full max-w-2xl bg-white p-5 rounded-xl shadow-md border border-gray-200">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <input
              type="text"
              placeholder="Enter Application ID"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="flex-1 px-5 py-3 text-gray-600 bg-transparent rounded-full focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>

          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {document && (
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-center">
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
              {document.status_history
                ?.sort(
                  (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
                )
                .slice(0, 1)
                .map((entry, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    {formatDate(entry.updated_at)}
                  </div>
                ))}
            </div>
            <div className="p-2 border-b">
              <strong>Uploaded At:</strong> {formatDate(document.uploaded_at)}
            </div>
          </div>

          <h3 className="mt-4 text-lg font-bold">Document Fields</h3>
          <div className="bg-gray-100 p-3 rounded">
            {document.document_fields.map((field, idx) => (
              <p key={idx}>
                <strong>{field.field_name}:</strong> {field.field_value}
              </p>
            ))}
          </div>

          <h3 className="mt-4 text-lg font-bold">Uploaded Documents</h3>
          <ul className="list-disc mt-3 list-inside flex flex-wrap gap-2">
            {document.documents.map((doc, idx) => (
              <li key={idx} className="flex items-center">
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 flex items-center gap-1"
                >
                  <FaFileAlt size={20} />
                  <span>{doc.document_type || `Document ${idx + 1}`}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchApplication;
