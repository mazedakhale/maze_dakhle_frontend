import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { FaDownload, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  // Get distributor_id from JWT token
  const getDistributorId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded);
      return decoded.user_id;
    }
    return null;
  };
  const distributorId = getDistributorId();
  console.log("Distributor ID:", distributorId);

  useEffect(() => {
    if (distributorId) {
      fetchErrorRequests(distributorId);
      fetchCertificates();
    }
  }, [distributorId]);

  // Fetch error requests for the distributor
  const fetchErrorRequests = async (distributorId) => {
    try {
      console.log(
        `Fetching error requests for distributor ID: ${distributorId}`
      );
      const response = await axios.get(
        ` http://72.60.206.65:3000/apirequest-errors/distributor/${distributorId}`
      );
      console.log("Error Requests API Response:", response.data);

      // Filter out rejected requests
      const filteredRequests = response.data.filter(
        (request) =>
          request.request_status === "Distributor Rejected" ||
          request.request_status === "Completed"
      );

      setErrorRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching error requests:", error);
    }
  };

  // Fetch all certificates
  const fetchCertificates = async () => {
    try {
      console.log("Fetching certificates...");
      const response = await axios.get(
        " http://72.60.206.65:3000/apicertificates"
      );
      console.log("Certificates API Response:", response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // Get certificate by document_id
  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    console.log(
      `Certificate found for Document ID ${documentId}:`,
      matchedCertificate
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
      console.log(`Fetching certificate for Certificate ID: ${certificateId}`);
      const response = await axios.get(
        ` http://72.60.206.65:3000/apicertificates/${certificateId}`
      );
      console.log("View Certificate API Response:", response.data);

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

  // Filter search results
  const filteredRequests = errorRequests.filter((request) =>
    Object.values(request).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDownloadCertificate = async (documentId, requestName) => {
    try {
      const response = await axios.get(
        ` http://72.60.206.65:3000/apidownload-certificate/${documentId}`,
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

  // import { FaDownload, FaEye } from "react-icons/fa";

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Error Request History
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

        {/* Search Bar */}
        <div className="p-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "Request ID",
                  "Application ID",
                  "Application Name",
                  "Description",
                  "Error Document",
                  "Request Status",
                  "Request Date",
                  "Certificate",
                  "Download Certificate",
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <tr
                    key={request.request_id}
                    className={`border border-gray-300 ${
                      index % 2 === 0 ? "bg-[#ffffff]" : "bg-[#F58A3B14]"
                    } hover:bg-gray-100`}
                  >
                    <td className="border p-3 text-center">
                      {request.request_id}
                    </td>
                    <td className="border p-3 text-center">
                      {request.application_id}
                    </td>
                    <td className="px-4 py-2 border">
                      {document?.document_fields ? ( // Use `document` instead of `doc`
                        Array.isArray(document.document_fields) ? (
                          document.document_fields.find(
                            (field) => field.field_name === "APPLICANT NAME"
                          ) ? (
                            <p>
                              {
                                document.document_fields.find(
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
                        ) : document.document_fields["APPLICANT NAME"] ? (
                          <p>{document.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">
                            No applicant name available
                          </p>
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>
                    <td className="border p-3">
                      {request.request_description}
                    </td>
                    <td className="border p-3 text-center">
                      <a
                        href={request.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Document
                      </a>
                    </td>

                    {/* Status Badge */}
                    <td className="border p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          request.request_status === "Approved"
                            ? "bg-green-500"
                            : request.request_status === "Distributor Rejected"
                            ? "bg-red-500"
                            : request.request_status === "Completed"
                            ? "bg-blue-500"
                            : request.request_status === "Uploaded"
                            ? "bg-purple-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {request.request_status}
                      </span>
                    </td>

                    <td className="border p-3 text-center">
                      {new Date(request.request_date).toLocaleString()}
                    </td>

                    {/* View Certificate */}
                    <td className="border p-3 text-center">
                      {["Uploaded", "Completed"].includes(
                        request.request_status
                      ) && getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleViewCertificate(request.document_id)
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded-md flex items-center gap-2 hover:bg-orange-600 transition"
                        >
                          <FaEye /> View Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500">No Certificate</span>
                      )}
                    </td>

                    {/* Download Certificate */}
                    <td className="border p-3 text-center">
                      {getCertificateByDocumentId(request.document_id) ? (
                        <button
                          onClick={() =>
                            handleDownloadCertificate(
                              request.document_id,
                              request.request_name
                            )
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-2 hover:bg-green-600 transition"
                        >
                          <FaDownload /> Download
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-600">
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
