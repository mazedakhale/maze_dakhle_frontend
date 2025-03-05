import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDocumentId, setUploadingDocumentId] = useState(null);

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
      console.log(`Fetching error requests for distributor ID: ${distributorId}`);
      const response = await axios.get(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors/distributor/${distributorId}`
      );
      console.log("Error Requests API Response:", response.data);

      // Filter out rejected requests
      const filteredRequests = response.data.filter(
        (request) => request.request_status !== "Distributor Rejected" && request.request_status !== "Completed"
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
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates");
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
    console.log(`Certificate found for Document ID ${documentId}:`, matchedCertificate);
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
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/${certificateId}`);
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

  // Reject request
  // const handleRejectStatus = async (requestId) => {
  //   try {
  //     console.log(`Rejecting request with Request ID: ${requestId}`);
  //     await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors/update-status/${requestId}`, {
  //       request_status: "Distributor Rejected",
  //     });
  //     fetchErrorRequests(distributorId);
  //     Swal.fire("Updated!", "Request has been rejected.", "success");
  //   } catch (error) {
  //     console.error("Error updating request status:", error);
  //     Swal.fire("Error", "Failed to reject request.", "error");
  //   }
  // };



const handleRejectStatus = async (requestId) => {
    const { value: rejectionReason } = await Swal.fire({
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
        }
    });

    // Ensure rejection reason is captured correctly
    if (!rejectionReason || rejectionReason.trim() === "") {
        console.error("❌ No rejection reason provided.");
        return;
    }

    try {
        console.log(`🔹 Rejecting request ID: ${requestId} with reason: ${rejectionReason}`);

        const response = await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors/update-status/${requestId}`, {
            request_status: "Distributor Rejected",
            rejectionReason: rejectionReason.trim(), // Ensure it's not undefined
        });

        console.log("✅ API Response:", response.data);

        fetchErrorRequests(distributorId);

        Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Request has been rejected successfully.",
            confirmButtonText: "OK",
        });

    } catch (error) {
        console.error("❌ Error updating request status:", error);

        if (error.response) {
            console.error("🛑 Server Response:", error.response.data);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to reject request: ${error.response.data.message || "Unknown error"}`,
                confirmButtonText: "OK",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to reject request. Please try again later.",
                confirmButtonText: "OK",
            });
        }
    }
};




  // Handle file selection
  const handleFileChange = (event, documentId) => {
    console.log("File selected:", event.target.files[0], "for Document ID:", documentId);
    setSelectedFile(event.target.files[0]);
    setUploadingDocumentId(documentId);
  };

  // Upload certificate
  const handleUploadCertificate = async (documentId, requestId) => {
    if (!selectedFile || uploadingDocumentId !== documentId) {
      Swal.fire("Error", "Please select a file to upload.", "error");
      return;
    }

    console.log(`Uploading certificate for Document ID: ${documentId}, Request ID: ${requestId}`);
    console.log("Selected file:", selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", distributorId);

    try {
      const uploadResponse = await axios.patch(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/update/${documentId}`,
        formData
      );
      console.log("Certificate Upload Response:", uploadResponse.data);

      // Update request status to "Uploaded"
      const updateStatusResponse = await axios.patch(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/request-errors/update-status/${requestId}`,
        { request_status: "Uploaded" }
      );
      console.log("Update Request Status Response:", updateStatusResponse.data);

      setSelectedFile(null);
      setUploadingDocumentId(null);
      fetchErrorRequests(distributorId);
      Swal.fire("Success", "Certificate uploaded successfully.", "success");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      Swal.fire("Error", "Failed to upload certificate.", "error");
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

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-md rounded-lg">
        <div className="bg-[#f5f0eb] border-t-4 shadow-md rounded border-orange-400 p-4">
          <h2 className="text-xl font-bold text-center text-gray-800">Error Requests</h2>
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
  
        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#f5f0eb]">
              <tr>
                {[
                  "Request ID",
                  "Application ID",
                  "Description",
                  "Error Document",
                  "Request Status",
                  "Request Date",
                  "Actions",
                  "Upload Certificate",
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
                      index % 2 === 0 ? "bg-[#fffaf4]" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="border p-3 text-center">{request.request_id}</td>
                    <td className="border p-3 text-center">{request.application_id}</td>
                    <td className="border p-3">{request.request_description}</td>
                    <td className="border p-3 text-center">
                      <a
                        href={request.error_document}
                        target="_blank"
                        className="text-blue-500 underline"
                      >
                        View Document
                      </a>
                    </td>
  
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
  
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => handleRejectStatus(request.request_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Distributor Rejected
                      </button>
                    </td>
  
                    <td className="border p-3 text-center">
                      <input
                        type="file"
                        className="border border-gray-300 p-2 rounded-md"
                        onChange={(e) => handleFileChange(e, request.document_id)}
                      />
                      <button
                        onClick={() =>
                          handleUploadCertificate(request.document_id, request.request_id)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded ml-2 hover:bg-blue-600 transition"
                      >
                        Upload
                      </button>
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
