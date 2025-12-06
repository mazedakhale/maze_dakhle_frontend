import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API_BASE_URL from "../config/api";
const CustomerHistory = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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
        .get(` ${API_BASE_URL}/documents/list`)
        .then((response) => {
          const allDocuments = response.data.documents;
          // Filter documents where status is "Completed"
          const filteredDocs = allDocuments
            .filter(
              (doc) => doc.user_id === userId && doc.status === "Completed"
            )
            .reverse(); // Show newest first
          setDocuments(filteredDocs);
        })
        .catch((error) => console.error("Error fetching documents:", error));

      axios
        .get(` ${API_BASE_URL}/certificates`)
        .then((response) => setCertificates(response.data))
        .catch((error) => console.error("Error fetching certificates:", error));
    }
  }, [userId]);

  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      // Extract the file extension from the URL (e.g., "pdf", "jpg", "png")
      const fileExtension = receiptUrl.split(".").pop().toLowerCase();

      // Generate the file name (e.g., "MyDocument_receipt.pdf")
      const fileName = `${documentName}_receipt.${fileExtension}`;

      // Create a temporary <a> element to trigger the download
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName; // Set the file name for the download
      link.style.display = "none"; // Hide the link element
      document.body.appendChild(link); // Add the link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up by removing the link
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire(
        "Error",
        "Failed to download receipt. Please try again.",
        "error"
      );
    }
  };
  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      alert("Certificate not found.");
      return;
    }

    try {
      const response = await axios.get(
        ` ${API_BASE_URL}/certificates/${certificateId}`
      );

      if (response.data && response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        alert("Certificate not found.");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      alert("Failed to fetch certificate.");
    }
  };

  const handleDownloadCertificate = async (documentId, name) => {
    try {
      const response = await axios.get(
        ` ${API_BASE_URL}/download-certificate/${documentId}`,
        {
          responseType: "blob", // Important to handle file downloads
        }
      );

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}.zip`); // Set ZIP file name based on user name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate.");
    }
  };

  const handleDownloadAllDocuments = async (documentId, doc) => {
    try {
      setIsAdding(true);
      const loadingToast = Swal.fire({
        title: "Preparing download...",
        text: "Please wait while we prepare your documents.",
        icon: "info",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(
        `${API_BASE_URL}/download/${documentId}`,
        {
          responseType: "blob",
          timeout: 120000,
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              Swal.update({
                title: "Downloading...",
                text: `${percentCompleted}% complete`,
              });
            }
          },
        }
      );

      loadingToast.close();

      // Extract filename from Content-Disposition header
      let filename = "";
      const contentDisposition = response.headers["content-disposition"];

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

        // If no filename from header, extract from document data
        if (!filename) {
          const applicantName = getApplicantName(doc.document_fields);

          // Use applicant name or fallback to application ID
          if (applicantName && applicantName !== "-") {
            filename = `${applicantName.replace(/\s+/g, "_")}.zip`;
          } else {
            filename = `${doc.application_id || `Document_${documentId}`}.zip`;
          }
        }      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: "Success",
        text: "Documents downloaded successfully!",
        icon: "success",
      });
    } catch (error) {
      console.error("Error downloading documents:", error);

      let errorMessage = "Failed to download documents. Please try again.";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Download timed out. Please try again later.";
      } else if (error.response) {
        if (
          error.response.data instanceof Blob &&
          error.response.data.type === "application/json"
        ) {
          try {
            const errorText = await new Response(error.response.data).text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
        } else if (error.response.status === 404) {
          errorMessage = "No documents found for download.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };
  

  const handleGenerateErrorRequest = (
    documentId,
    applicationId,
    distributorId,
    userId,
    categoryId,
    subcategoryId,
    name,
    email
  ) => {
    navigate(`/Adderrorrequest`, {
      state: {
        documentId,
        applicationId,
        distributorId,
        userId,
        categoryId,
        subcategoryId,
        name,
        email,
      },
    });
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Completed Applications List
          </h2>
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

        {/* Search Bar */}
        <div className="p-4 flex justify-end items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
          />
        </div>

        {/* Table */}
        <div className="table-container border border-gray-300 rounded-lg shadow-md overflow-x-auto p-6">
          <table className="table border-collapse border border-gray-300 min-w-full text-sm">
            <thead className="bg-gray-300">
              <tr>
                {[
                  "S.No",
                  "Application ID",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone No",
                  "Applicants Name",
                  "Verification",
                  "Download Receipt",
                  " Download Certificate",
                  " Download OC",
                  "Error Request",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-4 border border-[#776D6DA8] text-black font-semibold text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr
                    key={doc.document_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.application_id}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {(() => {
                        const date = new Date(doc.uploaded_at);
                        const formattedDate = `${String(
                          date.getDate()
                        ).padStart(2, "0")}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}-${date.getFullYear()}`;
                        const formattedTime = date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        });

                        return (
                          <>
                            <div>{formattedDate}</div>
                            <div className="text-sm text-gray-600">
                              {formattedTime}
                            </div>
                          </>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.category_name}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.subcategory_name}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.name}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.email}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.phone}
                    </td>
                    {/* Applicant Name */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {getApplicantName(doc.document_fields)}
                    </td>

                    <td className="border p-2">
                      <div className="flex flex-col gap-1">
                        {/* Status Badge */}
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

                        {/* Latest Status Date and Time */}
                        {doc.status_history
                          ?.sort(
                            (a, b) =>
                              new Date(b.updated_at) - new Date(a.updated_at)
                          ) // Sort by latest date
                          .slice(0, 1) // Take the first entry (latest status)
                          .map((statusEntry, index) => {
                            const date = new Date(statusEntry.updated_at);
                            const formattedDate = `${String(
                              date.getDate()
                            ).padStart(2, "0")}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}-${date.getFullYear()}`;
                            const formattedTime = date.toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }
                            );

                            return (
                              <div
                                key={index}
                                className="text-xs text-gray-600"
                              >
                                <div>{formattedDate}</div>
                                <div className="text-sm text-gray-600">
                                  {formattedTime}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </td>

                    {/* Download Receipt */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">
                          Not Available
                        </span>
                      )}
                    </td>

                    {/* Certificate */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">
                          Not Available
                        </span>
                      )}
                    </td>

                    {/* Download OC */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      <button
                        onClick={() =>
                          handleDownloadAllDocuments(doc.document_id, doc)
                        }
                        className="bg-purple-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-purple-600 transition"
                      >
                        <FaDownload className="mr-1" /> Download OC
                      </button>
                    </td>

                    {/* Error Request */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      <button
                        onClick={() =>
                          handleGenerateErrorRequest(
                            doc.document_id,
                            doc.application_id,
                            doc.distributor_id,
                            doc.user_id,
                            doc.category_id,
                            doc.subcategory_id,
                            doc.name,
                            doc.email,
                            doc.phone
                          )
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-yellow-600 transition"
                      >
                        <FaExclamationTriangle className="mr-1" /> send error
                        request if wrong certificate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-4 border border-[#776D6DA8] text-center"
                  >
                    No completed documents found.
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

export default CustomerHistory;
