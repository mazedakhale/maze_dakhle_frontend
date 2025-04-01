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

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId =
          decodedToken.user_id || decodedToken.id || decodedToken.user;
        if (userId) {
          setDistributorId(userId);
          fetchDocuments(userId);
        } else {
          console.error("User ID is missing in the decoded token.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("Token is missing.");
    }
  }, []);

  const fetchDocuments = async (distributorId) => {
    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/documents/list/${distributorId}`
      );

      const filteredDocuments = response.data.documents.filter(
        (doc) => doc.status !== "Uploaded" && doc.status !== "Completed"
      );

      // Sort documents by uploaded_at date in descending order (latest first)
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      });

      setDocuments(sortedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleViewInvoice = (documentId) => {
    navigate(`/Distributorinvoice/${documentId}`);
  };

  const handleView = (documentId) => {
    navigate(`/Distributorview/${documentId}`);
  };

  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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
        "https://mazedakhale.in/api/certificates/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      axios
        .get('https://mazedakhale.in/api/certificates')
        .then((response) => setCertificates(response.data))
        .catch((error) => console.error("Error fetching certificates:", error));

      await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
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

  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find((cert) => cert.document_id === documentId);
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      alert("Certificate not found.");
      return;
    }
    try {
      const response = await axios.get(`https://mazedakhale.in/api/certificates/${certificateId}`);
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

  return (
    <div className="ml-[280px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        <div className="border-t-4 border-orange-400 bg-[#f4f4f4] text-center p-4 rounded-t-lg relative">
          <h2 className="text-2xl font-bold text-gray-800">Manage Distributor List</h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
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
                  className={`border border-gray-300 ${index % 2 === 0 ? "bg-[#ffffff]" : "#F58A3B14"}`}
                >
                  <td className="border p-3 text-center">{doc.application_id}</td>
                  <td className="px-4 py-2 border text-sm">
                    {doc?.document_fields ? (
                      Array.isArray(doc.document_fields) ? (
                        // New format (array of objects)
                        doc.document_fields.find(field => field.field_name === "APPLICANT NAME") ? (
                          <p>{doc.document_fields.find(field => field.field_name === "APPLICANT NAME").field_value}</p>
                        ) : (
                          <p className="text-gray-500">No applicant name available</p>
                        )
                      ) : (
                        // Old format (object with key-value pairs)
                        doc.document_fields["APPLICANT NAME"] ? (
                          <p>{doc.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">No applicant name available</p>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">No fields available</p>
                    )}
                  </td>
                  <td className="border p-2">
                    {new Date(doc.uploaded_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',  // Added seconds
                      hour12: true, // Use AM/PM
                    })}
                  </td>
                  <td className="border p-3 text-center">{doc.category_name}</td>
                  <td className="border p-3 text-center">{doc.subcategory_name}</td>
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
                        onClick={() => handleDownloadReceipt(doc.receipt_url, doc.name)}
                        className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                      >
                        <FaDownload className="mr-1" /> Receipt
                      </button>
                    ) : (
                      <span className="text-gray-500 text-center">Not Available</span>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {getCertificateByDocumentId(doc.document_id) ? (
                      <button
                        onClick={() => handleViewCertificate(doc.document_id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
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

export default VerifyDocuments;