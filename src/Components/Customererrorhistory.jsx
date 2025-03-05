import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaDownload } from "react-icons/fa";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchErrorRequests();
    fetchCertificates();
  }, []);

  // Fetch error requests (only completed ones)
  const fetchErrorRequests = async () => {
    try {
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors");

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
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates");
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
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/${certificateId}`
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
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/download-certificate/${documentId}`,
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

  return (
    <div className="ml-[300px] p-6">
      <div className="bg-white shadow-md p-4 rounded-md">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Completed Error Requests</h1>
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Request ID</th>
                <th className="border px-4 py-2">Application ID</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Error Document</th>
                <th className="border px-4 py-2">Request Status</th>
                <th className="border px-4 py-2">Request Date</th>
                <th className="border px-4 py-2">Certificate</th>
                <th className="border p-3">Download Certificate</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2 text-center">
                      {request.request_id}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {request.application_id}
                    </td>
                    <td className="border px-4 py-2">{request.request_description}</td>
                    <td className="border px-4 py-2 text-center">
                      <a
                        href={request.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span className="px-3 py-1 rounded-full text-white text-sm bg-blue-500">
                        {request.request_status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(request.document_id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span>No Certificate</span>
                      )}
                    </td>

                    <td className="border p-2 text-center">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleDownloadCertificate(request.document_id, request.request_name)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-green-600 transition"
                        >
                          <FaDownload className="mr-1" /> Download
                        </button>
                      ) : (
                        <span className="text-gray-500 text-center">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
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
