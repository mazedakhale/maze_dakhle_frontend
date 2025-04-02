import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { FaDownload } from "react-icons/fa";

const DlistPage = () => {
  const { state } = useLocation();
  const { categoryId, subcategoryId } = state || {};
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [distributorId, setDistributorId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [certificates, setCertificates] = useState([]);

  const navigate = useNavigate();

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

  // Fetch documents based on category, subcategory, and distributor ID
  useEffect(() => {
    if (categoryId && subcategoryId && distributorId) {
      const DOCUMENTS_API_URL = ` https://mazedakhale.in/api/documents/${categoryId}/${subcategoryId}?distributorId=${distributorId}`;
      console.log("API URL:", DOCUMENTS_API_URL); // Debugging

      const fetchDocuments = async () => {
        try {
          const response = await axios.get(DOCUMENTS_API_URL);
          console.log("Fetched documents:", response.data); // Debugging

          // Sort documents by uploaded_at in descending order (newest first)
          const sortedDocuments = [...response.data].sort((a, b) =>
            new Date(b.uploaded_at) - new Date(a.uploaded_at)
          );

          setDocuments(sortedDocuments);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      };
      fetchDocuments();
      fetchCertificates();
    }
  }, [categoryId, subcategoryId, distributorId]);

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      const response = await axios.get(" https://mazedakhale.in/api/certificates");
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // Get certificate by document_id
  const getCertificateByDocumentId = (documentId) => {
    return certificates.find((cert) => cert.document_id === documentId);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter documents based on search query and status filter
  const filteredDocuments = documents
    .filter((document) =>
      Object.values(document).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter((document) =>
      statusFilter === "All" ? true : document.status === statusFilter
    );

  // Handle file change for certificate upload
  const handleFileChange = (event, documentId) => {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setSelectedFiles((prev) => ({ ...prev, [documentId]: file }));
      setFilePreviews((prev) => ({ ...prev, [documentId]: fileURL }));
      setPreviewFile(fileURL);
      setShowPreview(true);
    }
  };

  // Handle cancel file for certificate upload
  const handleCancelFile = (documentId) => {
    if (filePreviews[documentId]) {
      URL.revokeObjectURL(filePreviews[documentId]);
    }
    setSelectedFiles((prev) => ({ ...prev, [documentId]: null }));
    setFilePreviews((prev) => ({ ...prev, [documentId]: null }));
    setShowPreview(false);
  };

  // Handle upload certificate
  const handleUploadCertificate = async (documentId) => {
    const file = selectedFiles[documentId];

    if (!file) {
      Swal.fire("Warning", "Please select a file first", "warning");
      return;
    }

    const selectedDocument = documents.find(
      (doc) => doc.document_id === documentId
    );
    if (!selectedDocument) {
      Swal.fire("Error", "Document not found", "error");
      return;
    }

    const { user_id, application_id, name } = selectedDocument;
    const finalUserId = user_id || distributorId;

    if (!finalUserId || !distributorId || !application_id || !name) {
      Swal.fire(
        "Error",
        "User ID, Distributor ID, Application ID, or Name is missing",
        "error"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_id", documentId.toString());
    formData.append("user_id", finalUserId.toString());
    formData.append("distributor_id", distributorId.toString());
    formData.append("application_id", application_id.toString());
    formData.append("name", name.toString());

    try {
      await axios.post(
        " https://mazedakhale.in/api/certificates/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await axios.put(
        ` https://mazedakhale.in/api/documents/update-status/${documentId}`,
        { status: "Uploaded" }
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.document_id === documentId
            ? { ...doc, status: "Uploaded" }
            : doc
        )
      );

      Swal.fire("Success", "Certificate uploaded successfully!", "success");
      fetchCertificates();
      setSelectedFiles((prev) => ({ ...prev, [documentId]: null }));
      setFilePreviews((prev) => ({ ...prev, [documentId]: null }));
    } catch (error) {
      console.error("Error uploading certificate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Internal server error",
        "error"
      );
    }
  };

  // Handle download receipt
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const fileExtension = receiptUrl.split('.').pop().toLowerCase();
      const fileName = `${documentName}_receipt.${fileExtension}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire("Error", "Failed to download receipt. Please try again.", "error");
    }
  };

  // Handle download certificate
  const handleDownloadCertificate = async (documentId, name) => {
    const certificate = getCertificateByDocumentId(documentId);
    if (!certificate) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }

    try {
      const response = await axios.get(` https://mazedakhale.in/api/certificates/${certificate.certificate_id}`);

      if (response.data && response.data.file_url) {
        const link = document.createElement("a");
        link.href = response.data.file_url;
        link.download = `${name}_certificate.pdf`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        Swal.fire("Error", "Certificate file not found.", "error");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      Swal.fire("Error", "Failed to download certificate. Please try again.", "error");
    }
  };

  // Handle view invoice
  const handleViewInvoice = (documentId) => {
    navigate(`/Distributorinvoice/${documentId}`);
  };

  // Handle view document
  const handleView = (documentId) => {
    navigate(`/Distributorview/${documentId}`);
  };

  // Define columns for the table
  const columns = [
    "Application ID",
    "Category",
    "Subcategory",
    "Email",
    "Status",
    "Uploaded At",
    "Action",
    "View",

    "Receipt",
    "Certificate",
  ];

  return (
    <div className="ml-[330px] flex flex-col min-h-screen p-5 bg-gray-100">
      <div className="w-full p-6">
        <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
          <div className="border-t-4 border-orange-400 bg-[#f4f4f4] text-center p-4 rounded-t-lg relative">
            <h2 className="text-2xl font-bold text-gray-800">
              Documents for Category ID: {categoryId} - Subcategory ID: {subcategoryId}</h2>
            <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
          </div>
          {/* Search Bar and Status Filter */}
          <div className="p-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Filter by Status:</span>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="All"
                  checked={statusFilter === "All"}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                All
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Approved"
                  checked={statusFilter === "Approved"}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                Approved
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Uploaded"
                  checked={statusFilter === "Uploaded"}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                Uploaded
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Pending"
                  checked={statusFilter === "Pending"}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                Pending
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Rejected"
                  checked={statusFilter === "Rejected"}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                Rejected
              </label>
            </div>
          </div>

          {/* Table */}
          <div className=" p-6 overflow-x-auto">
            <table className="min-w-full table-auto bg-white rounded shadow border border-gray-300">
              <thead className="bg-[#F58A3B14] border-b-2">
                <tr>
                  {columns.map((header, index) => (
                    <th key={index} className="px-4 py-2 border text-black font-semibold text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document, index) => (
                    <tr
                      key={document.document_id}
                      className={`border border-gray-300 ${index % 2 === 0 ? "bg-[#Ffffff]" : "bg-[#F58A3B14]"
                        }`}
                    >
                      <td className="px-4 py-2 border text-center">{document.application_id}</td>
                      <td className="px-4 py-2 border text-center">{document.category_name}</td>
                      <td className="px-4 py-2 border text-center">{document.subcategory_name}</td>
                      <td className="px-4 py-2 border text-center">{document.email}</td>
                      <td className="border p-2">
                        <div className="flex flex-col gap-1">
                          {/* Status Badge */}
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
                      <td className="px-4 py-2 border text-center">
                        {new Date(document.uploaded_at).toLocaleString()}
                      </td>
                      <td className="border p-3 text-center">
                        <button
                          onClick={() => handleViewInvoice(document.document_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Action
                        </button>
                      </td>
                      <td className="border p-3 text-center">
                        <button
                          onClick={() => handleView(document.document_id)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                        >
                          View
                        </button>
                      </td>
                      <td className="border p-3 text-center">
                        {document.receipt_url ? (
                          <button
                            onClick={() => handleDownloadReceipt(document.receipt_url, document.name)}
                            className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                          >
                            <FaDownload className="mr-1" /> Receipt
                          </button>
                        ) : (
                          <span className="text-gray-500 text-center">Not Available</span>
                        )}
                      </td>
                      <td className="border p-3 text-center">
                        {getCertificateByDocumentId(document.document_id) ? (
                          <button
                            onClick={() => handleDownloadCertificate(document.document_id, document.name)}
                            className="bg-green-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-green-600 transition"
                          >
                            <FaDownload className="mr-1" /> Certificate
                          </button>
                        ) : (
                          <span className="text-gray-500 text-center">Not Available</span>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-2 border text-center">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="relative w-3/4 h-3/4 bg-white shadow-lg rounded-lg flex flex-col">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded"
            >
              Close
            </button>
            <iframe src={previewFile} className="w-full h-full border-none"></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default DlistPage;