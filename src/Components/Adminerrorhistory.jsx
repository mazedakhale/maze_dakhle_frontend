import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

import Swal from "sweetalert2";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchErrorRequests();
    fetchCertificates();
  }, []);

  // Fetch error requests
  const fetchErrorRequests = async () => {
    try {
      const response = await axios.get(
        "https://mazedakhale.in/api/request-errors"
      );
      setErrorRequests(response.data);
    } catch (error) {
      console.error("Error fetching error requests:", error);
    }
  };

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      const response = await axios.get(
        "https://mazedakhale.in/api/certificates"
      );
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // Get certificate by document ID
  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

  // View certificate
  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }
    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/certificates/${certificateId}`
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

  const handleDownloadCertificate = async (documentId, requestName) => {
    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/download-certificate/${documentId}`,
        {
          responseType: "blob", // Important to handle file downloads
        }
      );

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${requestName}.zip`); // ✅ Use request_name for the ZIP file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate.");
    }
  };

  // Filter requests based on search term and include only "Completed" status
  const filteredRequests = errorRequests
    .filter((request) => request.request_status === "Completed")
    .filter((request) =>
      Object.values(request).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Error Request History
          </h2>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Adashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto p-4">
          <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-lg">
            <thead className="bg-[#F58A3B14] text-gray-700 text-sm uppercase">
              <tr>
                {[
                  "Request ID",
                  "Application ID",
                  "Description",
                  "Error Document",
                  "Document ID",
                  "User ID",
                  "Distributor ID",
                  "Request Status",
                  "Request Date",
                  "Download Certificate",
                ].map((header) => (
                  <th key={header} className="border px-4 py-3 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <tr
                    key={request.request_id}
                    className={`hover:bg-orange-50 transition ${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    }`}
                  >
                    <td className="border px-4 py-3 text-center">
                      {request.request_id}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {request.application_id}
                    </td>
                    <td className="border px-4 py-3">
                      {request.request_description}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <a
                        href={request.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {request.document_id}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {request.user_id}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {request.distributor_id}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <span className="px-3 py-1 rounded-full text-white text-sm bg-blue-500">
                        {request.request_status}
                      </span>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleViewCertificate(request.document_id)
                          }
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500">No Certificate</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-gray-500">
                    No error requests found.
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

export default ErrorRequests;
