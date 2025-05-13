import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
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

  // Fetch error requests (only completed ones)
  const fetchErrorRequests = async () => {
    try {
      const response = await axios.get(
        "https://mazedakhale.in/api/request-errors"
      );

      // ✅ Filter requests to include only those with status "Completed"
      const completedRequests = response.data.filter(
        (request) => request.request_status?.toLowerCase() === "completed"
      );

      setErrorRequests(completedRequests);
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

  // Download certificate using request_name for the ZIP file name
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

  // Filter requests based on search term
  const filteredRequests = errorRequests.filter((request) =>
    Object.values(request).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  //import { FaDownload } from "react-icons/fa";

  //const ErrorRequests = ({ searchTerm, setSearchTerm, filteredRequests, getCertificateByDocumentId, handleViewCertificate, handleDownloadCertificate }) => {
  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Completed Error List
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
            className="border border-[#776D6DA8] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            {/* Table Header */}
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "Request ID",
                  "Application ID",
                  "Description",
                  "Error Document",
                  "Request Status",
                  "Request Date",
                  "Certificate",
                  "Download Certificate",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border text-black font-semibold text-center border-[#776D6DA8]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <tr
                    key={request.request_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {request.request_id}
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {request.application_id}
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {request.request_description}
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      <a
                        href={request.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      <span className="px-3 py-1 rounded-full text-white text-sm bg-blue-500">
                        {request.request_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleViewCertificate(request.document_id)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span>No Certificate</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border text-center border-[#776D6DA8]">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleDownloadCertificate(
                              request.document_id,
                              request.request_name
                            )
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-green-600 transition"
                        >
                          <FaDownload className="mr-1" /> Download
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">
                          Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-3 border text-center border-[#776D6DA8]"
                  >
                    No completed error requests found.
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
