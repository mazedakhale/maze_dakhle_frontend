import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaRegFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
const EmployeeDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false); // Start with loading false
  const [categoryInfo, setCategoryInfo] = useState({
    categoryId: "",
    categoryName: "",
    subcategoryId: "",
    subcategoryName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get selected category and subcategory from localStorage
    const categoryId = localStorage.getItem("selectedCategoryId");
    const categoryName = localStorage.getItem("selectedCategoryName");
    const subcategoryId = localStorage.getItem("selectedSubcategoryId");
    const subcategoryName = localStorage.getItem("selectedSubcategoryName");

    setCategoryInfo({
      categoryId,
      categoryName,
      subcategoryId,
      subcategoryName,
    });

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If we have the required IDs, fetch documents
    if (categoryId && subcategoryId && token) {
      // Decode token manually
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const userData = JSON.parse(jsonPayload);

        if (userData && userData.user_id) {
          fetchDocuments(
            categoryId,
            subcategoryId,
            userData.user_id,
            userData.role
          );
        } else {
          Swal.fire("Error", "User information not found in token", "error");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        Swal.fire("Error", "Invalid token format", "error");
      }
    } else {
      if (!categoryId || !subcategoryId) {
        Swal.fire(
          "Error",
          "Category or subcategory information is missing",
          "error"
        );
      } else if (!token) {
        Swal.fire("Error", "User token not found", "error");
      }
    }
  }, []);

  const fetchDocuments = async (
    categoryId,
    subcategoryId,
    userId,
    userRole
  ) => {
    try {
      // Check if user role is Admin or Employee
      if (userRole === "Admin" || userRole === "Employee") {
        // Use the API endpoint
        const response = await axios.get(
          `http://localhost:3000/documents/category-docs/${categoryId}/${subcategoryId}/${userId}`
        );

        if (response.data.error) {
          Swal.fire("Error", response.data.error, "error");
          setDocuments([]);
        } else {
          setDocuments(response.data);
        }
      } else {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch documents", "error");
      setDocuments([]);
    }
  };

  // Helper function for unauthorized users
  const handleUnauthorized = () => {
    setDocuments([]);
    Swal.fire(
      "Access Denied",
      "You don't have permission to view these documents",
      "error"
    );
    navigate("/dashboard"); // Redirect unauthorized users
  };

  // Handle search and filter changes
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter documents based on search query and status filter
  const filteredDocuments = documents
    .filter((doc) =>
      statusFilter
        ? doc.status?.toLowerCase() === statusFilter.toLowerCase()
        : true
    )
    .filter((doc) => {
      if (!searchQuery) return true;

      const lowerQuery = searchQuery.toLowerCase();

      return (
        doc.document_id?.toString().toLowerCase().includes(lowerQuery) ||
        doc.document_name?.toLowerCase().includes(lowerQuery) ||
        doc.user?.name?.toLowerCase().includes(lowerQuery) ||
        doc.user?.email?.toLowerCase().includes(lowerQuery) ||
        doc.user?.phone?.toString().toLowerCase().includes(lowerQuery) ||
        categoryInfo.categoryName.toLowerCase().includes(lowerQuery) ||
        categoryInfo.subcategoryName.toLowerCase().includes(lowerQuery)
      );
    });

  // Get user role from token for access control
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const userData = JSON.parse(jsonPayload);
      return userData.role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  // Only show the component to Admin or Employee users
  if (userRole !== "Admin" && userRole !== "Employee") {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-500">Access Denied</h2>
          <p className="mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Handle view document
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  // Handle view invoice
  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Invoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  // Handle download receipt
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const fileExtension = receiptUrl.split(".").pop().toLowerCase();
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
      Swal.fire(
        "Error",
        "Failed to download receipt. Please try again.",
        "error"
      );
    }
  };

  // Handle view certificate
  const handleViewCertificate = async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/certificates/by-document/${documentId}`
      );
      if (response.data && response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        Swal.fire("Error", "Certificate not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  return (
    <div className="w-[calc(100%-350px)] ml-[310px] mt-[80px] p-6">
      {/* Outer Container */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-300">
        {/* Header */}
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-center text-gray-800">
            {categoryInfo.categoryName} &gt; {categoryInfo.subcategoryName}{" "}
            Documents
          </h2>
        </div>

        {/* Search Bar and Status Filter */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <span className="text-gray-700">Filter by Status:</span>
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
                value="Completed"
                checked={statusFilter === "Completed"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Completed
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
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="table-container border border-gray-300 rounded-lg shadow-md mt-4">
        <table className="table border-collapse border border-gray-300 min-w-full">
          <thead className="bg-gray-300">
            <tr>
              <th className="border p-2 text-center font-bold">Sr No.</th>
              <th className="border p-2 text-center font-bold">
                Application Id
              </th>
              <th className="border p-2 text-center font-bold">
                Applicant Name
              </th>
              <th className="border p-2 text-center font-bold">Datetime</th>
              <th className="border p-2 font-bold">Category</th>
              <th className="border p-2 font-bold">Subcategory</th>
              <th className="border p-2 font-bold">VLE Name</th>
              <th className="border p-2 font-bold">VLE Email</th>
              <th className="border p-2 font-bold">VLE Phone</th>
              <th className="border p-2 font-bold">Verification</th>
              <th className="border p-2 font-bold">Action</th>
              <th className="border p-2 font-bold">View</th>
              <th className="border p-2 font-bold">Receipt</th>
              <th className="border p-2 font-bold">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
                <tr
                  key={doc.id || doc.document_id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-center">
                    {doc.application_id || doc.document_id}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {doc?.document_fields ? (
                      Array.isArray(doc.document_fields) ? (
                        // New format (array of objects)
                        doc.document_fields.find(
                          (field) => field.field_name === "APPLICANT NAME"
                        ) ? (
                          <p>
                            {
                              doc.document_fields.find(
                                (field) => field.field_name === "APPLICANT NAME"
                              ).field_value
                            }
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            No applicant name available
                          </p>
                        )
                      ) : // Old format (object with key-value pairs)
                      doc.document_fields["APPLICANT NAME"] ? (
                        <p>{doc.document_fields["APPLICANT NAME"]}</p>
                      ) : (
                        <p className="text-gray-500">
                          No applicant name available
                        </p>
                      )
                    ) : (
                      <p className="text-gray-500">
                        {doc.document_name || "No name available"}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    {new Date(
                      doc.upload_date || doc.uploaded_at
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="border p-2">
                    {doc.category_name || categoryInfo.categoryName}
                  </td>
                  <td className="border p-2">
                    {doc.subcategory_name || categoryInfo.subcategoryName}
                  </td>
                  <td className="border p-2">{doc.user?.name || "N/A"}</td>
                  <td className="border p-2">{doc.user?.email || "N/A"}</td>
                  <td className="border p-2">{doc.user?.phone || "N/A"}</td>
                  <td className="border p-2">
                    <div className="flex flex-col gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          doc.status === "Completed"
                            ? "bg-yellow-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : doc.status === "Approved"
                            ? "bg-blue-500"
                            : "bg-gray-500" // Default for other statuses
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Latest Status Date and Time */}
                      {doc.status_history
                        ?.sort(
                          (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                        ) // Sort by latest date
                        .slice(0, 1) // Take the first entry (latest status)
                        .map((statusEntry, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {new Date(statusEntry.updated_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit", // Added seconds
                                hour12: true, // Use AM/PM
                              }
                            )}
                          </div>
                        ))}
                    </div>
                  </td>
                  <td className="border p-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => window.open(doc.document_path, "_blank")}
                    >
                      <FaRegFileAlt className="inline mr-1" /> View
                    </button>
                  </td>
                  <td className="border p-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() =>
                        handleViewInvoice(
                          doc.document_id || doc.id,
                          categoryInfo.categoryId,
                          categoryInfo.subcategoryId
                        )
                      }
                    >
                      <FaFileInvoice className="inline mr-1" /> Action
                    </button>
                  </td>
                  <td className="border p-2">
                    {doc.receipt_url ? (
                      <button
                        className="bg-purple-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          handleDownloadReceipt(
                            doc.receipt_url,
                            doc.document_name || "document"
                          )
                        }
                      >
                        <FaDownload className="inline mr-1" /> Receipt
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {doc.certificate_id || doc.has_certificate ? (
                      <button
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          handleViewCertificate(doc.document_id || doc.id)
                        }
                      >
                        <FaDownload className="inline mr-1" /> Certificate
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No certificate
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center py-10 bg-gray-50">
                  <FaRegFileAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No documents found for this category and subcategory.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDocumentList;
