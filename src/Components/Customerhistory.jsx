import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt, FaDownload, FaExclamationTriangle } from "react-icons/fa";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const CustomerHistory = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        .get(`https://mazedakhale.in/documents/list`)
        .then((response) => {
          const allDocuments = response.data.documents;
          // Filter documents where status is "Completed"
          const filteredDocs = allDocuments
            .filter((doc) => doc.user_id === userId && doc.status === "Completed" || "Received")
            .reverse(); // Show newest first
          setDocuments(filteredDocs);
        })
        .catch((error) => console.error("Error fetching documents:", error));

      axios
        .get("https://mazedakhale.in/certificates")
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
      const fileExtension = receiptUrl.split('.').pop().toLowerCase();

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
      Swal.fire("Error", "Failed to download receipt. Please try again.", "error");
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
        `https://mazedakhale.in/certificates/${certificateId}`
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
        `https://mazedakhale.in/download-certificate/${documentId}`,
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

  const handleGenerateErrorRequest = (documentId, applicationId, distributorId, userId, categoryId, subcategoryId, name, email) => {
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
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">                    <h2 className="text-xl font-bold text-center text-gray-800">
          Completed List
        </h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
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
                    className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                      } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {doc.application_id}
                    </td>
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {new Date(doc.uploaded_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit", // Added seconds
                        hour12: true, // Use AM/PM
                      })}
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
                      {doc?.document_fields ? (
                        Array.isArray(doc.document_fields) ? (
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
                            <p className="text-gray-500">No applicant name available</p>
                          )
                        ) : doc.document_fields["APPLICANT NAME"] ? (
                          <p>{doc.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">No applicant name available</p>
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>

                    <td className="border p-2">
                      <div className="flex flex-col gap-1">
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${doc.status === "Approved"
                            ? "bg-green-500"
                            : doc.status === "Rejected"
                              ? "bg-red-500"
                              : doc.status === "Pending"
                                ? "bg-yellow-500" // Color for Pending
                                : "bg-blue-500" // Default color
                            }`}
                        >
                          {doc.status}
                        </span>

                        {/* Latest Status Date and Time */}
                        {doc.status_history
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

                    {/* Download Receipt */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
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

                    {/* Certificate */}
                    <td className="px-4 py-4 border border-[#776D6DA8] text-center">
                      {getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">Not Available</span>
                      )}
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
                        <FaExclamationTriangle className="mr-1" />  send error request if wrong certificate
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
}

export default CustomerHistory;