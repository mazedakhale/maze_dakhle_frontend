import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaFileInvoice,
  FaDownload,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const Userpendinglist = () => {
  const [documents, setDocuments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [certificates, setCertificates] = useState([]); // State for certificates
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  // Fetch user ID from token
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
    if (!userId) return;

    // Allowed statuses
    const allowedStatuses = ["Pending"];

    axios
      .get("http://localhost:3000/documents/list")
      .then((response) => {
        const allDocuments = response.data.documents;
        const filteredDocs = allDocuments
          .filter(
            (doc) =>
              doc.user_id === userId && allowedStatuses.includes(doc.status)
          )
          .reverse();
        setDocuments(filteredDocs);
      })
      .catch((error) => console.error("Error fetching documents:", error));

    // Fetch certificates
    axios
      .get("http://localhost:3000/certificates")
      .then((response) => setCertificates(response.data))
      .catch((error) => console.error("Error fetching certificates:", error));
  }, [userId]);

  // Filter documents based on search query and status
  const filteredDocuments = documents.filter((doc) => {
    const searchString =
      `${doc.user_id} ${doc.document_id} ${doc.category_name} ${doc.subcategory_name} ${doc.name} ${doc.email} ${doc.phone} ${doc.address} ${doc.application_id}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter
      ? doc.status.toLowerCase() === statusFilter.toLowerCase()
      : true;
    return searchString && statusMatch;
  });

  // Handle reupload for a specific document type
  const handleReupload = async (documentId, documentType) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("documentType", documentType);

          const response = await axios.post(
            ` http://localhost:3000/documents/reupload/${documentId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Reupload successful:", response.data);
          alert("Document reuploaded successfully.");

          const updatedDocuments = documents.map((doc) =>
            doc.document_id === documentId ? response.data.document : doc
          );
          setDocuments(updatedDocuments);
        } catch (error) {
          console.error("Error reuploading document:", error);
          let errorMessage = "Failed to reupload document. Please try again.";
          if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.request) {
            errorMessage = "Network error. Please check your connection.";
          }
          alert(errorMessage);
        }
      }
    };

    fileInput.click();
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
    const certificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    if (!certificate) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }

    const newTab = window.open("", "_blank");

    try {
      const response = await axios.get(
        ` http://localhost:3000/certificates/${certificate.certificate_id}`
      );
      if (response.data && response.data.file_url) {
        newTab.location.href = response.data.file_url;
      } else {
        newTab.close();
        Swal.fire("Error", "Certificate not found.", "error");
      }
    } catch (error) {
      newTab.close();
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  // Get certificate by document ID
  const getCertificateByDocumentId = (documentId) => {
    return certificates.find((cert) => cert.document_id === documentId);
  };

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/Customerview/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Customerinvoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Applications List
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

        {/* Search & Filter */}
        <div className="p-4 flex justify-end items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Received">Received</option>
          </select>
        </div>

        {/* Table Container with Scrollbar */}
        <div className="table-container border border-gray-300 rounded-lg shadow-md overflow-x-auto p-4">
          <table className="table border-collapse border border-gray-300 min-w-full text-sm">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "Sr.No",
                  "Application ID",
                  "Applicant Name",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone no",
                  "Action",
                  "View",
                  "Documents",
                  "Verification",
                  "Download Receipt",
                  "Certificate",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.document_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.application_id}
                    </td>
                    <td className="px-4 py-2 border">
                      {doc?.document_fields ? (
                        Array.isArray(doc.document_fields) ? (
                          doc.document_fields.find(
                            (field) => field.field_name === "APPLICANT NAME"
                          ) ? (
                            <p>
                              {
                                doc.document_fields.find(
                                  (field) =>
                                    field.field_name === "APPLICANT NAME"
                                ).field_value
                              }
                            </p>
                          ) : (
                            <p className="text-gray-500">
                              No applicant name available
                            </p>
                          )
                        ) : doc.document_fields["APPLICANT NAME"] ? (
                          <p>{doc.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">
                            No applicant name available
                          </p>
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>
                    <td className="border p-2 text-center">
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
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.category_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.subcategory_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.email}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.phone}
                    </td>
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
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
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
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            doc.status === "Approved"
                              ? "bg-green-500"
                              : doc.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {doc.status}
                        </span>

                        {doc.status_history
                          ?.sort(
                            (a, b) =>
                              new Date(b.updated_at) - new Date(a.updated_at)
                          )
                          .slice(0, 1)
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

                    <td className="border p-3 text-center">
                      {(doc.status === "Received" ||
                        doc.status === "Uploaded") &&
                      doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>

                    <td className="border p-2 text-center">
                      {doc.status === "Completed" &&
                      getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                        >
                          <FaCheck className="mr-1" /> Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="17"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No documents found.
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

export default Userpendinglist;
