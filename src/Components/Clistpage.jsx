import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { FaRegFileAlt, FaDownload, FaFileInvoice, FaCheck, FaTimes } from "react-icons/fa";

const ClistPage = () => {
  const { state } = useLocation();
  const { categoryId, subcategoryId } = state || {};
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);

  // Extract user ID from token
  useEffect(() => {
    const getUserId = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          return decodedToken.user_id; // Adjust according to your backend token structure
        } catch (error) {
          console.error("Error decoding token:", error);
          return null;
        }
      }
      return null;
    };

    const id = getUserId();
    console.log("Extracted User ID:", id); // Debugging
    setUserId(id);
  }, []);

  // Fetch documents based on categoryId, subcategoryId, and userId
  useEffect(() => {
    if (categoryId && subcategoryId && userId) {
      const DOCUMENTS_API_URL = `https://mazedakhale.in/api/documents/doc/${categoryId}/${subcategoryId}/${userId}`;
      console.log("API URL:", DOCUMENTS_API_URL); // Debugging

      const fetchDocuments = async () => {
        try {
          const response = await axios.get(DOCUMENTS_API_URL);
          console.log("Fetched documents:", response.data); // Debugging
          setDocuments(response.data);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      };
      fetchDocuments();
    }
  }, [categoryId, subcategoryId, userId]); // Depend on userId

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = documents.filter((document) =>
    Object.values(document).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  return (
    <div className="w-[calc(100%-260px)] ml-[310px] mt-[80px] p-6">
      {/* Outer Container */}
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
          <h2 className="text-2xl font-bold text-gray-800">
            Documents for Category ID: {categoryId} - Subcategory ID: {subcategoryId}
          </h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search in table"
            value={searchQuery}
            onChange={handleSearch}
            className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
          />
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            {/* Table Header */}
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "Document ID",
                  "Application ID",
                  "APPLICANT NAME",

                  "Category",
                  "Subcategory",
                  "VLE Email",

                  " VLE Name ",

                  " VLE Phone no",
                  "Status",
                  "Uploaded At",
                  // "Action",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document, index) => (
                  <tr
                    key={document.document_id}
                    className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                      } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.document_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.application_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document?.document_fields ? (
                        Array.isArray(document.document_fields) ? (
                          document.document_fields.find(
                            (field) => field.field_name === "APPLICANT NAME"
                          ) ? (
                            <p>
                              {
                                document.document_fields.find(
                                  (field) => field.field_name ===
                                    "APPLICANT NAME"
                                ).field_value
                              }
                            </p>
                          ) : (
                            <p className="text-gray-500">
                              No applicant name available
                            </p>
                          )
                        ) : document.document_fields["APPLICANT NAME"] ? (
                          <p>{document.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">
                            No applicant name available
                          </p>
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.category_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.subcategory_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.email}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.phone}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <div className="flex flex-col gap-1">
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm ${document.status === "Approved"
                            ? "bg-green-500"
                            : document.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                            }`}
                        >
                          {document.status}
                        </span>

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
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {new Date(document.uploaded_at).toLocaleString()}
                    </td>
                    {/* <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                                View
                                            </button>
                                        </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

};

export default ClistPage;
