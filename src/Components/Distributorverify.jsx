import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes, FaDownload, FaCheck } from "react-icons/fa";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const VerifyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [distributorId, setDistributorId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.user_id || decodedToken.id || decodedToken.user;
          if (userId) {
            setDistributorId(userId);
            // Parallel fetching
            await Promise.all([
              fetchDocuments(userId),
              fetchCertificates()
            ]);
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error", "Failed to load data", "error");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, []);


  const fetchDocuments = async (distributorId) => {
    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/documents/list/${distributorId}`
      );

      const filteredDocuments = response.data.documents.filter(
        (doc) => doc.status !== "Uploaded" && doc.status !== "Completed"
      );

      const sortedDocuments = filteredDocuments.sort((a, b) => {
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      });

      setDocuments(sortedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await axios.get("https://mazedakhale.in/api/certificates");
      setCertificates(response.data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
    }
  };

  const handleViewInvoice = (documentId) => {
    navigate(`/Distributorinvoice/${documentId}`);
  };

  const handleView = (documentId) => {
    navigate(`/Distributorview/${documentId}`);
  };

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

  const handleCancelFile = (documentId) => {
    if (filePreviews[documentId]) {
      URL.revokeObjectURL(filePreviews[documentId]);
    }
    setSelectedFiles((prev) => ({ ...prev, [documentId]: null }));
    setFilePreviews((prev) => ({ ...prev, [documentId]: null }));
    setShowPreview(false);
  };

  const handleUploadCertificate = async (documentId) => {
    const file = selectedFiles[documentId];

    if (!file) {
      Swal.fire("Warning", "Please select a file first", "warning");
      return;
    }

    // File validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Error", "Only JPEG, PNG, and PDF files are allowed", "error");
      return;
    }

    if (file.size > maxSize) {
      Swal.fire("Error", "File size must be less than 5MB", "error");
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
        "Required document information is missing",
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
      setIsLoading(true);
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we upload your certificate",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Upload certificate
      await axios.post(
        "https://mazedakhale.in/api/certificates/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      // Update status
      await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
        { status: "Uploaded" },
        { timeout: 30000 }
      );

      // Refresh data
      await fetchCertificates();
      await fetchDocuments(distributorId);

      Swal.fire("Success", "Certificate uploaded successfully!", "success");
      handleCancelFile(documentId);
    } catch (error) {
      console.error("Error uploading certificate:", error);
      let errorMessage = "Failed to upload certificate";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
      Swal.close();
    }
  };

  const getCertificateByDocumentId = (documentId) => {
    if (!certificates.length) return null;
    return certificates.find(
      (cert) => String(cert.document_id) === String(documentId)
    );
  };

  const handleViewCertificate = async (documentId) => {
    const certificate = getCertificateByDocumentId(documentId);
    if (!certificate) {
      Swal.fire("Error", "Certificate not found", "error");
      return;
    }

    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/certificates/${certificate.certificate_id}`
      );

      if (response.data?.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        Swal.fire("Error", "Certificate URL not found", "error");
      }
    } catch (error) {
      console.error("Error viewing certificate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to view certificate",
        "error"
      );
    }
  };

  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const fileExtension = receiptUrl.split('.').pop().toLowerCase();
      const fileName = `${documentName || 'document'}_receipt.${fileExtension}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire("Error", "Failed to download receipt", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="ml-[280px] flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="ml-[280px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden w-full max-w-6xl">
        <div className="border-t-4 border-orange-400 bg-[#f4f4f4] text-center p-4 rounded-t-lg relative">
          <h2 className="text-2xl font-bold text-gray-800">Manage Distributor List</h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
        </div>

        <div className="p-6 overflow-x-auto">
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">No documents found</p>
            </div>
          ) : (
            <table className="w-full border border-gray-300">
              <thead className="bg-[#F58A3B14]">
                <tr>
                  {[
                    "Application ID",
                    "Applicant Name",
                    "Date",
                    "Category",
                    "Subcategory",
                    "Status",
                    "Actions",
                    "View",
                    "Receipt",
                    "Certificate"
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 p-3 text-center font-semibold text-black"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr
                    key={doc.document_id}
                    className={`border border-gray-300 ${index % 2 === 0 ? "bg-[#ffffff]" : "#F58A3B14"
                      }`}
                  >
                    <td className="border p-3 text-center">{doc.application_id}</td>
                    <td className="px-4 py-2 border text-sm">
                      {doc?.document_fields ? (
                        Array.isArray(doc.document_fields) ? (
                          doc.document_fields.find(field => field.field_name === "APPLICANT NAME") ? (
                            <p>{doc.document_fields.find(field => field.field_name === "APPLICANT NAME").field_value}</p>
                          ) : (
                            <p className="text-gray-500">No applicant name</p>
                          )
                        ) : (
                          doc.document_fields["APPLICANT NAME"] ? (
                            <p>{doc.document_fields["APPLICANT NAME"]}</p>
                          ) : (
                            <p className="text-gray-500">No applicant name</p>
                          )
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>
                    <td className="border p-2 text-sm">
                      {new Date(doc.uploaded_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="border p-3 text-center">{doc.category_name}</td>
                    <td className="border p-3 text-center">{doc.subcategory_name}</td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${doc.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        doc.status === "Approved" ? "bg-green-100 text-green-800" :
                          doc.status === "Rejected" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => handleViewInvoice(doc.document_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                      >
                        Action
                      </button>
                    </td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => handleView(doc.document_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-sm"
                      >
                        View
                      </button>
                    </td>
                    <td className="border p-3 text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() => handleDownloadReceipt(doc.receipt_url, doc.name)}
                          className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition text-sm"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-xs"
                        >
                          <FaCheck className="mr-1" /> View
                        </button>
                      ) : doc.status === "Approved" ? (
                        <span className="text-gray-500">Certificate Not Available</span>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="relative w-3/4 h-3/4 bg-white shadow-lg rounded-lg flex flex-col">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded"
            >
              Close
            </button>
            <iframe
              src={previewFile}
              className="w-full h-full border-none"
              title="File Preview"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDocuments;