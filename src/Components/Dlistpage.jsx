import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";

const ElistPage = () => {
  const { state } = useLocation();
  const { categoryId, subcategoryId } = state || {};
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [distributorId, setDistributorId] = useState(null);

  // Extract distributor ID from token
  useEffect(() => {
    const getDistributorId = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          return decodedToken.user_id; // Ensure this matches your backend token structure
        } catch (error) {
          console.error("Error decoding token:", error);
          return null;
        }
      }
      return null;
    };

    const id = getDistributorId();
    console.log("Extracted Distributor ID:", id); // Debugging
    setDistributorId(id);
  }, []);

  useEffect(() => {
    if (categoryId && subcategoryId && distributorId) {
      const DOCUMENTS_API_URL = `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/${categoryId}/${subcategoryId}?distributorId=${distributorId}`;
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
  }, [categoryId, subcategoryId, distributorId]); // Depend on distributorId

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = documents.filter((document) =>
    Object.values(document).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="ml-[330px] flex flex-col min-h-screen p-5 bg-gray-100">
      <div className="w-full p-6">
        <div className="w-full max-w-7xl bg-white p-0 shadow-lg rounded-lg overflow-hidden">
          <div className="border-t-4 shadow-md border-orange-400 bg-[#f5f0eb] text-center p-4 m-0">
            <h2 className="text-2xl font-bold text-gray-800 m-0 p-0">
              Documents for Category ID: {categoryId} - Subcategory ID: {subcategoryId}
            </h2>
          </div>





          {/* Search Bar (Left-Aligned) */}
          <div className="p-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white rounded shadow border border-gray-300">
              {/* Table Header */}
              <thead className="bg-[#f5f0eb] border-b-2 border-orange-400">
                <tr>
                  {[
                    "Document ID",
                    "Category",
                    "Subcategory",
                    "Email",
                    "Status",
                    "Uploaded At",
                    "Document Fields",
                    "Action",
                  ].map((header, index) => (
                    <th key={index} className="px-4 py-2 border text-black font-semibold text-center">
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
                      className={`border border-gray-300 ${index % 2 === 0 ? "bg-[#fffaf4]" : "bg-white"
                        }`}
                    >
                      <td className="px-4 py-2 border text-center">{document.document_id}</td>
                      <td className="px-4 py-2 border text-center">{document.category_name}</td>
                      <td className="px-4 py-2 border text-center">{document.subcategory_name}</td>
                      <td className="px-4 py-2 border text-center">{document.email}</td>
                      <td className="px-4 py-2 border text-center">
                        {/* Styled Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm ${document.status === "Approved"
                              ? "bg-green-500"
                              : document.status === "Pending"
                                ? "bg-yellow-500"
                                : document.status === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                        >
                          {document.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {new Date(document.uploaded_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {Object.entries(document.document_fields).map(([key, value]) => (
                          <p key={key} className="text-gray-700">
                            {key}: {value}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {/* Styled View Button */}
                        <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 border text-center">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );

};

export default ElistPage;
