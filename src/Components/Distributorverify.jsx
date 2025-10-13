import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes, FaDownload, FaCheck } from "react-icons/fa";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const VerifyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [distributorId, setDistributorId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // Fetch user ID, documents, and certificates on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.user_id || decoded.id || decoded.user;
        if (userId) {
          setDistributorId(userId);
          fetchDocuments(userId);
          fetchCertificates();
        } else {
          console.error("User ID is missing in the decoded token.");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    } else {
      console.error("Token is missing.");
    }
  }, []);

  // Get list of certificates
  const fetchCertificates = async () => {
    try {
      const response = await axios.get("http://72.60.206.65:3000/certificates");
      // assume response.data is an array of certificate objects
      setCertificates(response.data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
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

  // Get list of documents, excluding only those still 'Sent'
  const fetchDocuments = async (distributorId) => {
    try {
      const response = await axios.get(
        `http://72.60.206.65:3000/documents/list/${distributorId}`
      );
      const filtered = response.data.documents.filter(
        (doc) => doc.status !== "Sent"
      );
      const sorted = filtered.sort(
        (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
      );
      setDocuments(sorted);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleViewInvoice = (id) => navigate(`/Distributorinvoice/${id}`);
  const handleView = (id) => navigate(`/Distributorview/${id}`);

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedFiles((p) => ({ ...p, [id]: file }));
    setFilePreviews((p) => ({ ...p, [id]: url }));
    setPreviewFile(url);
    setShowPreview(true);
  };

  const handleCancelFile = (id) => {
    if (filePreviews[id]) URL.revokeObjectURL(filePreviews[id]);
    setSelectedFiles((p) => ({ ...p, [id]: null }));
    setFilePreviews((p) => ({ ...p, [id]: null }));
    setShowPreview(false);
  };

  const getCertificateByDocumentId = (documentId) => {
    const cert = certificates.find(
      (c) => String(c.document_id) === String(documentId)
    );
    return cert ? cert.certificate_id : null;
  };

  const handleUploadCertificate = async (documentId) => {
    const file = selectedFiles[documentId];
    if (!file) {
      return Swal.fire("Warning", "Please select a file first", "warning");
    }
    const doc = documents.find((d) => d.document_id === documentId);
    if (!doc) return Swal.fire("Error", "Document not found", "error");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_id", documentId);
    formData.append("user_id", doc.user_id || distributorId);
    formData.append("distributor_id", distributorId);
    formData.append("application_id", doc.application_id);
    formData.append("name", doc.name);

    try {
      await axios.post("http://72.60.206.65:3000/certificates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // re-fetch certificates and update document status
      await fetchCertificates();
      await axios.put(
        `http://72.60.206.65:3000/documents/update-status/${documentId}`,
        { status: "Uploaded" }
      );
      setDocuments((p) =>
        p.map((d) =>
          d.document_id === documentId ? { ...d, status: "Uploaded" } : d
        )
      );
      Swal.fire("Success", "Certificate uploaded successfully!", "success");
      handleCancelFile(documentId);
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Internal server error",
        "error"
      );
    }
  };

  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId)
      return Swal.fire("Error", "Certificate not found", "error");
    try {
      const res = await axios.get(
        `http://72.60.206.65:3000/certificates/${certificateId}`
      );
      if (res.data.file_url) window.open(res.data.file_url, "_blank");
      else Swal.fire("Error", "Certificate file not found", "error");
    } catch (err) {
      console.error("Error fetching certificate:", err);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Manage Applications List
          </h2>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Ddashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "Application ID",
                  "Applicant Name",
                  "Date",
                  "Category",
                  "Subcategory",
                  "Actions",
                  "View",
                  "Receipt",
                  "Certificate",
                ].map((h, i) => (
                  <th key={i} className="border p-3 text-center font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr
                  key={doc.document_id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"}
                >
                  <td className="border p-3 text-center">
                    {doc.application_id}
                  </td>
                  <td className="border px-4 py-2 text-sm">
                    {Array.isArray(doc.document_fields)
                      ? doc.document_fields.find(
                          (f) => f.field_name === "APPLICANT NAME"
                        )?.field_value || "-"
                      : doc.document_fields["APPLICANT NAME"] || "-"}
                  </td>
                  <td className="border p-2 text-center">
                    {(() => {
                      const date = new Date(doc.uploaded_at);
                      const formattedDate = `${String(date.getDate()).padStart(
                        2,
                        "0"
                      )}-${String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      )}-${date.getFullYear()}`;
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
                  <td className="border p-3 text-center">
                    {doc.category_name}
                  </td>
                  <td className="border p-3 text-center">
                    {doc.subcategory_name}
                  </td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleViewInvoice(doc.document_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Action
                    </button>
                  </td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleView(doc.document_id)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                    >
                      View
                    </button>
                  </td>
                  <td className="border p-3 text-center">
                    {doc.receipt_url ? (
                      <button
                        onClick={() =>
                          handleDownloadReceipt(doc.receipt_url, doc.name)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition flex items-center justify-center"
                      >
                        <FaDownload className="mr-1" /> Receipt
                      </button>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {getCertificateByDocumentId(doc.document_id) ? (
                      <button
                        onClick={() => handleViewCertificate(doc.document_id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center justify-center"
                      >
                        <FaCheck className="mr-1" /> Certificate
                      </button>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="relative w-3/4 h-3/4 bg-white shadow-lg rounded-lg">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded"
            >
              Close
            </button>
            <iframe src={previewFile} className="w-full h-full border-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDocuments;
