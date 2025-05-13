import React, { useEffect, useState } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

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

  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

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

  const handleUpdateStatus = async (requestId, newStatus) => {
    let rejectionReason = "";

    if (newStatus === "Rejected") {
      const { value } = await Swal.fire({
        title: "Enter Rejection Reason",
        input: "text",
        inputPlaceholder: "Type your reason here...",
        showCancelButton: true,
        confirmButtonText: "Reject",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value.trim()) {
            return "Rejection reason is required!";
          }
        },
      });

      if (!value) {
        return; // If user cancels, stop further execution
      }
      rejectionReason = value.trim();
    }

    // ✅ Instantly update UI before API response
    setErrorRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.request_id === requestId
          ? { ...req, request_status: newStatus }
          : req
      )
    );

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Status has been updated successfully.",
      timer: 2000,
      showConfirmButton: false,
    });

    try {
      await axios.patch(
        `https://mazedakhale.in/api/request-errors/update-status/${requestId}`,
        {
          request_status: newStatus,
          rejectionReason,
        }
      );
    } catch (error) {
      console.error("Error updating request status:", error);
      Swal.fire("Error", "Failed to update status.", "error");

      // ❌ If API fails, revert status change
      fetchErrorRequests();
    }
  };

  const filteredRequests = errorRequests
    .filter((request) => request.request_status !== "Completed")
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
            Error Requests
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

        {/* Search Bar */}
        <div className="p-4 flex justify-end">
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
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
                  "Certificate",
                  "Actions",
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
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <tr
                    key={request.request_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.request_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.application_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.request_description}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <a
                        href={request.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.document_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.user_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {request.distributor_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          request.request_status === "Approved"
                            ? "bg-green-500"
                            : request.request_status === "Rejected"
                            ? "bg-red-500"
                            : request.request_status === "Uploaded"
                            ? "bg-purple-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {request.request_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {["Uploaded", "Completed"].includes(
                        request.request_status
                      ) && getCertificateByDocumentId(request.document_id) ? (
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
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <select
                        className="border p-1 rounded"
                        value={request.request_status}
                        onChange={(e) =>
                          handleUpdateStatus(request.request_id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
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
