import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  FaRegFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EmployeeCertificateList = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Helper function to detect name fields in multiple languages
  const getApplicantName = (documentFields) => {
    if (!documentFields) return "-";
    const namePatterns = ["name", "applicant name", "full name", "customer name", "person name", "नाम", "आवेदक का नाम", "पूरा नाम", "व्यक्ति का नाम", "ग्राहक का नाम", "नाव", "अर्जदाराचे नाव", "पूर्ण नाव", "व्यक्तीचे नाव", "ग्राहकाचे नाव", "applicant", "अर्जदार", "आवेदक"];
    const isNameField = (fieldName) => {
      if (!fieldName || typeof fieldName !== "string") return false;
      const lowerFieldName = fieldName.toLowerCase().trim();
      const matchesPattern = namePatterns.some(pattern => lowerFieldName.includes(pattern.toLowerCase()) || fieldName.includes(pattern));
      if (matchesPattern) return true;
      const nameIndicators = [/\bname\b/i, /\bfull\b/i, /\bfirst\b/i, /\blast\b/i, /\bapplicant\b/i, /name$/i, /नाम$/i, /नाव$/i, /^name/i, /^नाम/i, /^नाव/i, /^full/i, /^applicant/i];
      return nameIndicators.some(pattern => pattern.test(fieldName));
    };
    const findBestNameField = (fields) => {
      const priorities = [/full.*name|name.*full/i, /applicant.*name|name.*applicant/i, /^name$/i, /name/i, /नाम|नाव/];
      for (const priority of priorities) {
        const match = fields.find(field => priority.test(field.key));
        if (match) return match;
      }
      return fields[0];
    };
    if (Array.isArray(documentFields)) {
      const nameFields = documentFields.filter(field => isNameField(field.field_name)).map(field => ({ key: field.field_name, value: field.field_value }));
      if (nameFields.length === 0) return "-";
      return findBestNameField(nameFields)?.value || "-";
    }
    if (typeof documentFields === "object") {
      const nameFields = Object.keys(documentFields).filter(key => isNameField(key)).map(key => ({ key, value: documentFields[key] }));
      if (nameFields.length === 0) return "-";
      return findBestNameField(nameFields)?.value || "-";
    }
    return "-";
  };

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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
        setUserId(userData.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch employee assignments and documents
  useEffect(() => {
    if (userId) {
      fetchEmployeeAssignments();
      fetchDocuments();
      fetchCertificates();
      fetchUsers();
    }
  }, [userId]);

  const fetchEmployeeAssignments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employee/employeeAsUser/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const assignments = response.data.map(assignment => ({
        id: assignment.id,
        category_id: assignment.category?.category_id,
        category_name: assignment.category?.category_name,
        subcategory_id: assignment.subcategory?.subcategory_id,
        subcategory_name: assignment.subcategory?.subcategory_name,
        user_id: assignment.user_id
      }));

      setEmployeeAssignments(assignments);
    } catch (error) {
      console.error("Error fetching employee assignments:", error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Fetch documents from the list API (like admin but filtered for employee)
      const response = await axios.get(`${API_BASE_URL}/documents/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        timeout: 120000
      });
      
      const sortedDocuments = response.data.documents.sort(
        (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
      );
      
      setDocuments(sortedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch documents.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates`);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/register`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Check if document is assigned to employee
  const isDocumentAssignedToEmployee = (doc) => {
    if (!userId || employeeAssignments.length === 0) return false;
    
    return employeeAssignments.some((assignment) => {
      return (
        assignment.category_id === doc.category_id &&
        assignment.subcategory_id === doc.subcategory_id
      );
    });
  };

  // Get certificate by document ID
  const getCertificateByDocumentId = (documentId) => {
    const certificate = certificates.find((cert) => cert.document_id === documentId);
    return certificate;
  };

  // Filter documents based on search query, status filter, employee assignments, and certificates
  const filteredDocuments = documents
    .filter(isDocumentAssignedToEmployee) // Only show assigned documents
    .filter((doc) => doc.status === "Uploaded") // Only documents with Uploaded status (waiting for certificate verification)
    .filter((doc) => getCertificateByDocumentId(doc.document_id)) // Only documents with certificates
    .filter((doc) =>
      statusFilter === "" ? true : doc.status === statusFilter
    )
    .filter((doc) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        doc.application_id?.toLowerCase().includes(lowerQuery) ||
        getApplicantName(doc.document_fields).toLowerCase().includes(lowerQuery) ||
        doc.category_name?.toLowerCase().includes(lowerQuery) ||
        doc.subcategory_name?.toLowerCase().includes(lowerQuery)
      );
    });

  // Handle receipt download
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
      Swal.fire("Error", "Failed to download receipt. Please try again.", "error");
    }
  };

  // Handle certificate viewing
  const handleViewCertificate = async (documentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/by-document/${documentId}`);
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

  // Handle certificate download
  const handleDownloadCertificate = async (documentId, documentName) => {
    try {
      const certificate = getCertificateByDocumentId(documentId);
      if (!certificate) {
        Swal.fire("Error", "Certificate not found.", "error");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/certificates/${certificate.certificate_id}`);
      if (response.data && response.data.file_url) {
        const link = document.createElement("a");
        link.href = response.data.file_url;
        link.download = `${documentName}_certificate.pdf`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        Swal.fire("Error", "Certificate file not found.", "error");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      Swal.fire("Error", "Failed to download certificate.", "error");
    }
  };

  // Handle approve certificate
  const handleCompleteCertificate = async (documentId, applicationId) => {
    try {
      const result = await Swal.fire({
        title: "Approve Certificate",
        text: `Are you sure you want to approve certificate for application ${applicationId}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Approve It!",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        // Show loading alert
        Swal.fire({
          title: "Updating Status",
          text: "Please wait while the status is being updated...",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.put(
          `${API_BASE_URL}/documents/update-status/${documentId}`,
          { status: "Completed" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            timeout: 30000
          }
        );

        // Update local state
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.document_id === documentId ? { ...doc, status: "Completed" } : doc
          )
        );

        Swal.fire("Success!", "Certificate has been approved successfully.", "success");
      }
    } catch (error) {
      console.error("Error approving certificate:", error);
      Swal.fire("Error", "Failed to approve certificate. Please try again.", "error");
    }
  };

  // Handle reject certificate
  const handleRejectCertificate = async (documentId, applicationId) => {
    try {
      const { value: rejectionReason } = await Swal.fire({
        title: "Reject Certificate",
        input: "text",
        inputLabel: "Rejection Reason",
        inputPlaceholder: "Enter the reason for rejecting this certificate...",
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Rejection reason is required!";
          }
        },
      });

      if (rejectionReason) {
        // Show loading alert
        Swal.fire({
          title: "Updating Status",
          text: "Please wait while the status is being updated...",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.put(
          `${API_BASE_URL}/documents/update-status/${documentId}`,
          {
            status: "Rejected",
            rejectionReason,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            timeout: 30000
          }
        );

        // Update local state
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.document_id === documentId
              ? {
                  ...doc,
                  status: "Rejected",
                  rejection_reason: rejectionReason,
                }
              : doc
          )
        );

        Swal.fire({
          title: "Success",
          text: "Certificate rejected successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      Swal.fire("Error", "Failed to reject certificate. Please try again.", "error");
    }
  };

  // Handle view document
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  if (loading) {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Certificate List - Assigned Documents
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 flex justify-between items-center bg-white border-b border-gray-300">
          <div className="flex items-center space-x-4">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search by Application ID, Name, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 font-bold">Sr No.</th>
                <th className="border p-2 font-bold">Application ID</th>
                <th className="border p-2 font-bold">Date</th>
                <th className="border p-2 font-bold">Applicant Name</th>
                <th className="border p-2 font-bold">Category</th>
                <th className="border p-2 font-bold">Subcategory</th>
                <th className="border p-2 font-bold">Status</th>
                <th className="border p-2 font-bold">View Document</th>
                <th className="border p-2 font-bold">Receipt</th>
                <th className="border p-2 font-bold">View Certificate</th>
                <th className="border p-2 font-bold">Download Certificate</th>
                <th className="border p-2 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.document_id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2 text-center">{doc.application_id}</td>
                    <td className="border p-2 text-center">
                      {(() => {
                        const date = new Date(doc.uploaded_at);
                        const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}-${date.getFullYear()}`;
                        return formattedDate;
                      })()}
                    </td>
                    <td className="border p-2">{getApplicantName(doc.document_fields)}</td>
                    <td className="border p-2">{doc.category_name}</td>
                    <td className="border p-2">{doc.subcategory_name}</td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white ${
                          doc.status === "Completed"
                            ? "bg-green-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : doc.status === "Approved"
                            ? "bg-blue-500"
                            : doc.status === "Uploaded"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleView(doc.document_id, doc.category_id, doc.subcategory_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-xs"
                      >
                        <FaRegFileAlt className="mr-1" /> View
                      </button>
                    </td>
                    <td className="border p-3 text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() => handleDownloadReceipt(doc.receipt_url, doc.application_id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">Not Available</span>
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleViewCertificate(doc.document_id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-xs"
                      >
                        <FaCheck className="mr-1" /> View
                      </button>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDownloadCertificate(doc.document_id, doc.application_id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                      >
                        <FaDownload className="mr-1" /> Download
                      </button>
                    </td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        {doc.status === "Uploaded" && (
                          <>
                            <button
                              onClick={() => handleCompleteCertificate(doc.document_id, doc.application_id)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition text-xs"
                              title="Approve Certificate"
                            >
                              <FaCheck className="mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectCertificate(doc.document_id, doc.application_id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs"
                              title="Reject Certificate"
                            >
                              <FaTimes className="mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {doc.status === "Completed" && (
                          <span className="text-green-600 text-xs font-semibold">
                            ✓ Approved
                          </span>
                        )}
                        {doc.status === "Rejected" && (
                          <span className="text-red-600 text-xs font-semibold">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center py-10 bg-gray-50">
                    <FaRegFileAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No certificates found for your assigned categories.
                    </p>
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

export default EmployeeCertificateList;