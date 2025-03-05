import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchErrorRequests();
    fetchCertificates();
  }, []);

  const fetchErrorRequests = async () => {
    try {
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors");
      setErrorRequests(response.data);
    } catch (error) {
      console.error("Error fetching error requests:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates");
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
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/${certificateId}`);
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
        req.request_id === requestId ? { ...req, request_status: newStatus } : req
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
      await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors/update-status/${requestId}`, {
        request_status: newStatus,
        rejectionReason,
      });
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
    <div className="ml-[300px] p-6">
      <div className="bg-white shadow-md p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Error Requests</h1>
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Request ID</th>
                <th className="border px-4 py-2">Application ID</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Error Document</th>
                <th className="border px-4 py-2">Document ID</th>
                <th className="border px-4 py-2">User ID</th>
                <th className="border px-4 py-2">Distributor ID</th>
                <th className="border px-4 py-2">Request Status</th>
                <th className="border px-4 py-2">Request Date</th>
                <th className="border px-4 py-2">Certificate</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2 text-center">{request.request_id}</td>
                    <td className="border px-4 py-2 text-center">{request.application_id}</td>
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
                    <td className="border px-4 py-2 text-center">{request.document_id}</td>
                    <td className="border px-4 py-2 text-center">{request.user_id}</td>
                    <td className="border px-4 py-2 text-center">{request.distributor_id}</td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${request.request_status === "Approved"
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
                    <td className="border px-4 py-2 text-center">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {["Uploaded", "Completed"].includes(request.request_status) &&
                        getCertificateByDocumentId(request.document_id) ? (
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
                    <td className="border px-4 py-2 text-center">
                      <select
                        className="border p-1 rounded"
                        value={request.request_status}
                        onChange={(e) => handleUpdateStatus(request.request_id, e.target.value)}
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
                  <td colSpan="10" className="text-center py-4">
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
