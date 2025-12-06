import axios from "axios";
import  API_BASE_URL  from "../config/api";
import React, { useEffect, useState, useRef } from "react";
import { FaRegFileAlt, FaDownload, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Draggable from "react-draggable";
import getEmbeddableUrl from "../utils/getEmbeddableUrl.js";
import "../styles/style.css";

const EmployeeRecentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState(true); // for future use
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [distributors, setDistributors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const nodeRef = useRef(null);

  const navigate = useNavigate();

  // Get userId from token
  const token = localStorage.getItem("token");
  let userId = null;
  try {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    userId = tokenData.user_id;
  } catch (error) {
    console.error("Error parsing token:", error);
  }

  // Helper function to detect name fields in multiple languages
  const getApplicantName = (documentFields) => {
    if (!documentFields) return "-";

    // Define name field patterns in different languages
    const namePatterns = [
      // English
      "name", "applicant name", "full name", "customer name", "person name",
      // Hindi
      "नाम", "आवेदक का नाम", "पूरा नाम", "व्यक्ति का नाम", "ग्राहक का नाम",
      // Marathi
      "नाव", "अर्जदाराचे नाव", "पूर्ण नाव", "व्यक्तीचे नाव", "ग्राहकाचे नाव",
      // Additional common patterns
      "applicant", "अर्जदार", "आवेदक"
    ];

    const isNameField = (fieldName) => {
      if (!fieldName || typeof fieldName !== "string") return false;
      
      const lowerFieldName = fieldName.toLowerCase().trim();
      
      // First check predefined patterns
      const matchesPattern = namePatterns.some(pattern => 
        lowerFieldName.includes(pattern.toLowerCase()) ||
        fieldName.includes(pattern) // For non-Latin scripts
      );

      if (matchesPattern) return true;

      // Fallback: Check for common name-like characteristics
      const nameIndicators = [
        // English indicators
        /\bname\b/i, /\bfull\b/i, /\bfirst\b/i, /\blast\b/i, /\bapplicant\b/i,
        // Look for fields that end with common name suffixes
        /name$/i, /नाम$/i, /नाव$/i,
        // Look for fields that start with name prefixes
        /^name/i, /^नाम/i, /^नाव/i, /^full/i, /^applicant/i
      ];

      return nameIndicators.some(pattern => pattern.test(fieldName));
    };

    const findBestNameField = (fields) => {
      // Priority order for selecting the best name field
      const priorities = [
        /full.*name|name.*full/i,  // Full name gets highest priority
        /applicant.*name|name.*applicant/i,  // Applicant name second
        /^name$/i,  // Simple "name" field third
        /name/i,    // Any field containing "name" last
        /नाम|नाव/   // Hindi/Marathi name fields
      ];

      for (const priority of priorities) {
        const match = fields.find(field => priority.test(field.key));
        if (match) return match;
      }

      // If no priority match, return the first name-like field
      return fields[0];
    };

    // Handle array format
    if (Array.isArray(documentFields)) {
      const nameFields = documentFields
        .filter(field => isNameField(field.field_name))
        .map(field => ({ key: field.field_name, value: field.field_value }));
      
      if (nameFields.length === 0) return "-";
      
      const bestField = findBestNameField(nameFields);
      return bestField?.value || "-";
    }

    // Handle object format
    if (typeof documentFields === "object") {
      const nameFields = Object.keys(documentFields)
        .filter(key => isNameField(key))
        .map(key => ({ key, value: documentFields[key] }));
      
      if (nameFields.length === 0) return "-";
      
      const bestField = findBestNameField(nameFields);
      return bestField?.value || "-";
    }

    return "-";
  };

  // Get employee assignments for the logged-in employee
  const getEmployeeAssignments = (userId) => {
    return employeeAssignments
      .filter((assignment) => assignment.user_id === parseInt(userId))
      .map((assignment) => ({
        category_id: assignment.category?.category_id || assignment.category_id,
        subcategory_id: assignment.subcategory?.subcategory_id || assignment.subcategory_id,
      }));
  };

  // Check if document matches employee's assignments
  const isDocumentAssignedToEmployee = (doc) => {
    if (!userId) return false;
    
    const assignments = getEmployeeAssignments(userId);
    
    // If no assignments, don't show any documents
    if (assignments.length === 0) return false;
    
    // Check if document's category and subcategory match any assignment
    return assignments.some((assignment) => {
      return (
        assignment.category_id === doc.category_id &&
        assignment.subcategory_id === doc.subcategory_id
      );
    });
  };

  useEffect(() => {
    // Fetch all data in parallel
    const docsReq = axios.get(`${API_BASE_URL}/documents/recent`, {
      timeout: 120000,
    });
    const distReq = axios.get(`${API_BASE_URL}/users/distributors`);
    const certReq = axios.get(`${API_BASE_URL}/certificates`);
    const usersReq = axios.get(`${API_BASE_URL}/users/register`);
    const empAssignReq = userId ? axios.get(`${API_BASE_URL}/employee`) : Promise.resolve({ data: [] });

    Promise.all([docsReq, distReq, certReq, usersReq, empAssignReq])
      .then(([docsResp, distResp, certResp, usersResp, empAssignResp]) => {
        // Filter applications to only show those assigned to this employee
        const allApplications = docsResp.data;
        setEmployeeAssignments(empAssignResp.data);
        
        setDistributors(distResp.data);
        setCertificates(certResp.data);
        setUsers(usersResp.data);

        // Filter applications after assignments are set
        const filteredApps = allApplications.filter(app => {
          if (!userId) return false;
          
          const assignments = empAssignResp.data
            .filter((assignment) => assignment.user_id === parseInt(userId))
            .map((assignment) => ({
              category_id: assignment.category?.category_id || assignment.category_id,
              subcategory_id: assignment.subcategory?.subcategory_id || assignment.subcategory_id,
            }));
          
          if (assignments.length === 0) return false;
          
          return assignments.some((assignment) => {
            return (
              assignment.category_id === app.category_id &&
              assignment.subcategory_id === app.subcategory_id
            );
          });
        });

        setApplications(filteredApps);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Download receipt helper
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const ext = receiptUrl.split(".").pop().toLowerCase();
      const fileName = `${documentName}_receipt.${ext}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      Swal.fire("Error", "Failed to download receipt.", "error");
    }
  };

  // Update status helper
  const handleUpdateStatus = async (documentId, newStatus) => {
    Swal.fire({
      title: "Updating...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
    try {
      await axios.put(
        `${API_BASE_URL}/documents/update-status/${documentId}`,
        { status: newStatus },
        { timeout: 30000 }
      );
      setApplications((apps) =>
        apps.map((doc) =>
          doc.document_id === documentId ? { ...doc, status: newStatus } : doc
        )
      );
      Swal.fire("Success", `Status set to ${newStatus}`, "success");
    } catch {
      Swal.fire("Error", "Unable to update status.", "error");
    }
  };

  const handleRejectWithReason = async (documentId) => {
    const { value: reason } = await Swal.fire({
      title: "Rejection Reason",
      input: "text",
      inputPlaceholder: "Why reject?",
      showCancelButton: true,
      inputValidator: (v) => !v && "Reason required",
    });
    if (reason) {
      try {
        await axios.put(
          `${API_BASE_URL}/documents/update-status/${documentId}`,
          { status: "Rejected", rejectionReason: reason }
        );
        setApplications((apps) =>
          apps.map((d) =>
            d.document_id === documentId
              ? { ...d, status: "Rejected", rejection_reason: reason }
              : d
          )
        );
        Swal.fire("Rejected", "Document has been rejected.", "success");
      } catch {
        Swal.fire("Error", "Failed to reject.", "error");
      }
    }
  };

  const getCertificateByDocumentId = (documentId) => {
    const cert = certificates.find((c) => c.document_id === documentId);
    return cert ? cert.certificate_id : null;
  };

  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/certificates/${certificateId}`
      );
      if (response.data && response.data.file_url) {
        return response.data?.file_url;
      } else {
        Swal.fire("Error", "Certificate not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  const handleDownloadCertificateURL = async (documentId, documentName) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/certificates/${certificateId}`
      );
      if (response.data && response.data.file_url) {
        // Extract the file extension from the URL
        const fileExtension = response.data.file_url.split(".").pop().toLowerCase();
        // Generate the file name
        const fileName = `${documentName}_certificate.${fileExtension}`;
        
        // Create a temporary <a> element to trigger the download (same as receipt)
        const link = document.createElement("a");
        link.href = response.data.file_url;
        link.download = fileName;
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
  
  const getDistributorName = (distributorId) => {
    const u = users.find((u) => Number(u.user_id) === Number(distributorId));
    return u ? u.name : "";
  };

  // Combined status + search filtering
  const filteredDocs = applications
    .filter((doc) => {
      if (!statusFilter) return true;
      switch (statusFilter) {
        case "Received":
          return !!doc.receipt_url;
        case "Sent":
          return doc.status === "Sent";
        case "Uploaded":
          return doc.status === "Uploaded";
        default:
          return doc.status === statusFilter;
      }
    })
    .filter((doc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.document_id.toString().includes(q) ||
        doc.name?.toLowerCase().includes(q) ||
        doc.email?.toLowerCase().includes(q) ||
        doc.category_name?.toLowerCase().includes(q) ||
        doc.subcategory_name?.toLowerCase().includes(q) ||
        doc.application_id?.toLowerCase().includes(q)
      );
    });

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="ml-[250px] p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-[90%] max-w-6xl bg-white rounded-lg shadow">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            View Recent Applications
          </h2>
          <button
            onClick={() => navigate("/Edashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 flex justify-between items-center border-b border-gray-300">
          <div className="flex items-center space-x-4">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-orange-300 p-2 rounded-md focus:ring-2 focus:ring-orange-400 text-sm"
            >
              <option value="">All</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Sent">Sent</option>
              <option value="Uploaded">Uploaded</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className="border border-orange-300 p-2 rounded-md focus:ring-2 focus:ring-orange-400 w-64 text-sm"
          />
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-300">
              <tr>
                {[
                  "Sr No.",
                  "Application Id",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "Applicant",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone",
                  "Distributor",
                  "Status",
                //   "Actions",
                  "View",
                  "Receipt",
                  "Certificate",
                ].map((h) => (
                  <th
                    key={h}
                    className="border p-2 text-center font-bold text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="15" className="border p-4 text-center text-gray-500">
                    No applications assigned to you yet.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, i) => {
                  const date = new Date(doc.uploaded_at);
                  const day = String(date.getDate()).padStart(2, "0");
                  const mon = String(date.getMonth() + 1).padStart(2, "0");
                  const ym = `${day}-${mon}-${date.getFullYear()}`;
                  const tm = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr
                      key={doc.document_id}
                      className={`border-t ${
                        i % 2 ? "bg-white" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <td className="border p-2 text-center">{i + 1}</td>
                      <td className="border p-2 text-center">
                        {doc.application_id}
                      </td>
                      <td className="border p-2 text-center">
                        <div>{ym}</div>
                        <div className="text-xs text-gray-600">{tm}</div>
                      </td>
                      <td className="border p-2">{doc.category_name}</td>
                      <td className="border p-2">{doc.subcategory_name}</td>
                      <td className="border px-4 py-2 text-sm">
                        {getApplicantName(doc.document_fields)}
                      </td>
                      <td className="border p-2 break-words">{doc.name}</td>
                      <td className="border p-2 break-words">{doc.email}</td>
                      <td className="border p-2 break-words">{doc.phone}</td>
                      <td className="border p-2">
                        {getDistributorName(doc.distributor_id)}
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            doc.status === "Approved"
                              ? "bg-green-500"
                              : doc.status === "Rejected"
                              ? "bg-red-500"
                              : doc.status === "Pending"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      {/* <td className="border p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(doc.document_id, "Completed")
                            }
                            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 text-white text-xs flex items-center"
                          >
                            <FaCheck className="mr-1" /> Complete
                          </button>
                          <button
                            onClick={() =>
                              handleRejectWithReason(doc.document_id)
                            }
                            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white text-xs flex items-center"
                          >
                            <FaTimes className="mr-1" /> Reject
                          </button>
                        </div>
                      </td> */}
                      <td className="border p-2 text-center">
                        <button
                          onClick={() =>
                            navigate(`/Invoice/${doc.document_id}`, {
                              state: {
                                categoryId: doc.category_id,
                                subcategoryId: doc.subcategory_id,
                              },
                            })
                          }
                          className="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-600 text-white text-xs flex items-center"
                        >
                          <FaRegFileAlt className="mr-1" /> View
                        </button>
                      </td>
                      <td className="border p-3 text-center">
                        {doc.receipt_url ? (
                          <button
                            onClick={() =>
                              handleDownloadReceipt(doc.receipt_url, doc.name)
                            }
                            className="bg-orange-500 px-3 py-1 rounded hover:bg-blue-600 text-white flex items-center"
                          >
                            <FaDownload className="mr-1" /> Receipt
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Not Available
                          </span>
                        )}
                      </td>
                      <td className="border p-2 text-center">
                        {getCertificateByDocumentId(doc.document_id) ? (
                          <>
                            <button
                              onClick={async() => {
                                await handleDownloadCertificateURL(doc.document_id, doc.name);
                              }}
                              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-white text-xs flex items-center mb-1"
                            >
                              <FaDownload className="mr-1" /> Certificate
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Not Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {previewFile && (
      <Draggable handle=".drag-handle" nodeRef={nodeRef}>
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            ref={nodeRef}
            className="relative w-3/4 md:w-2/3 lg:w-1/2 h-3/4 bg-gray-100 rounded-lg p-4 drag-handle cursor-move"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold z-10"
              onClick={() => setPreviewFile(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-medium mb-4 text-center">
              Document Preview
            </h3>
            
            {/* Enhanced iframe with error handling */}
            <iframe
              src={previewFile}
              title="Document Preview"
              className="w-full border rounded"
              style={{ height: 'calc(100% - 80px)' }}
              onError={(e) => {
                console.error('Iframe loading error:', e);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
            
            {/* Fallback link */}
            <div className="mt-2 text-center">
              <a
                href={previewFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Open in new tab if preview doesn't work
              </a>
            </div>
          </div>
        </div>
      </Draggable>
    )}
    </div>
  );
};

export default EmployeeRecentApplications;