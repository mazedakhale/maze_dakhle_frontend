import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt, FaExclamationTriangle, FaRegFileAlt, FaFileInvoice } from "react-icons/fa";

import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const CustomerApply = () => {
  const [documents, setDocuments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      axios
        .get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/list`)
        .then((response) => {
          const allDocuments = response.data.documents;
          const filteredDocs = allDocuments
            .filter((doc) => doc.user_id === userId && doc.status !== "Completed") // Excluding "Completed" status
            .reverse(); // Show newest first
          setDocuments(filteredDocs);
        })
        .catch((error) => console.error("Error fetching documents:", error));
    }
  }, [userId]);

  // Search and Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    const searchString = `${doc.user_id} ${doc.document_id} ${doc.category_name} ${doc.subcategory_name} ${doc.name} ${doc.email} ${doc.phone} ${doc.address}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter
      ? doc.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return searchString && statusMatch;
  });

  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Customerinvoice/${documentId}`, { state: { categoryId, subcategoryId } });
  };


  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/Customerview/${documentId}`, { state: { categoryId, subcategoryId } });
  };




  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[310px] flex-shrink-0">{/* <Sidebar /> */}</div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 mt-5 overflow-hidden">
        <div className="w-full bg-white p-6">
          {/* Header with Search and Filter */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Customer Applications</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Uploaded">Uploaded</option>
              </select>
            </div>
          </div>

          {/* Table Container with Scroll */}
          <div className="w-full max-h-[75vh] overflow-y-auto border border-gray-300">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead className="bg-gray-300">
                <tr>
                  <th className="border p-3">S.No</th>
                  <th className="border p-3">Application ID</th>
                  {/* <th className="border p-3">Document ID</th> */}
                  <th className="border p-3">Category</th>
                  <th className="border p-3">Subcategory</th>
                  <th className="border p-3">Name</th>
                  <th className="border p-3">Email</th>
                  {/* <th className="border p-3">Phone</th> */}
                  {/* <th className="border p-3">Address</th> */}
                  {/* <th className="border p-3">Document Fields</th> */}
                  <th className="border p-2 font-bold">Action</th>
                  <th className="border p-2 font-bold">View</th>
                  <th className="border p-3">Documents</th>
                  <th className="border p-3">Verification</th>

                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <tr key={doc.document_id} className="border-t hover:bg-gray-100">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2 text-center">{doc.application_id}</td>
                    {/* <td className="border p-2 text-center">{doc.document_id}</td> */}
                    <td className="border p-2">{doc.category_name}</td>
                    <td className="border p-2">{doc.subcategory_name}</td>
                    <td className="border p-2">{doc.name}</td>
                    <td className="border p-2">{doc.email}</td>
                    {/* <td className="border p-2">{doc.phone}</td> */}
                    {/* <td className="border p-2">{doc.address}</td> */}
                    {/* <td className="border p-2">
                      {Object.entries(doc.document_fields).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </td> */}

                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleViewInvoice(doc.document_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-red-600 transition"
                      >
                        <FaFileInvoice className="mr-1" /> Action
                      </button>
                    </td>

                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleView(doc.document_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-indigo-600 transition"
                      >
                        <FaFileInvoice className="mr-1" /> View
                      </button>
                    </td>

                    <td className="border p-2">
                      <div className="flex justify-center">
                        {doc.documents &&
                          doc.documents.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaFileAlt className="text-blue-500 text-xl" />
                            </a>
                          ))}
                      </div>
                    </td>

                    <td className="border p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm flex justify-center ${doc.status === "Approved"
                          ? "bg-green-500"
                          : doc.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                          }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                  </tr>
                ))}
                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
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

export default CustomerApply;
