import React, { useEffect, useState } from "react";
import axios from "axios";

const CompletedApplicationsList = () => {
  const [userId, setUserId] = useState(null);
  const [completedDocuments, setCompletedDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Decode user_id from token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.user_id);
    }
  }, []);

  // Fetch completed documents and certificates based on user_id
  useEffect(() => {
    if (!userId) return;

    const fetchCompletedDocuments = async () => {
      try {
        const response = await axios.get(
          `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/completed/${userId}`
        );
        console.log("Fetched completed documents:", response.data);

        const sortedDocs = response.data.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setCompletedDocuments(sortedDocs);
      } catch (error) {
        console.error("Error fetching completed documents:", error);
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

    fetchCompletedDocuments();
    fetchCertificates();
  }, [userId]);

  // Handle search query change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter documents based on search query
  const filteredDocuments = completedDocuments.filter((document) => {
    return Object.values(document).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get certificate by document ID
  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => String(cert.document_id) === String(documentId)
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

  // Handle View Certificate
  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) {
      alert("Certificate not found.");
      return;
    }

    try {
      const response = await axios.get(
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/${certificateId}`
      );

      if (response.data && response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        alert("Certificate file not available.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Certificate not found on the server.");
      } else {
        console.error("Error fetching certificate:", error);
        alert("Failed to fetch certificate.");
      }
    }
  };

  return (
    <div className="ml-[300px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      <div className="w-full p-6">
        {/* Increased container width */}
        <div className="w-full max-w-[1800px] bg-white p-6 shadow-lg">
          {/* Heading and Search Bar */}
          <div className="flex w-full justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Completed Applications</h2>
            <input
              type="text"
              placeholder="Search in table..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded w-64"
            />
          </div>

          {/* Force table to expand and allow horizontal scrolling */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-[1200px] table-auto bg-white rounded shadow">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="px-6 py-3 border">Document ID</th>
                  <th className="px-6 py-3 border">Category</th>
                  <th className="px-6 py-3 border">Subcategory</th>
                  <th className="px-6 py-3 border">Email</th>
                  <th className="px-6 py-3 border">Status</th>
                  <th className="px-6 py-3 border">Uploaded At</th>
                  <th className="px-6 py-3 border">Document Fields</th>
                  <th className="px-6 py-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <tr key={document.document_id}>
                      <td className="px-6 py-3 border">{document.document_id}</td>
                      <td className="px-6 py-3 border">{document.category_name}</td>
                      <td className="px-6 py-3 border">{document.subcategory_name}</td>
                      <td className="px-6 py-3 border">{document.email}</td>
                      <td className="px-6 py-3 border">{document.status}</td>
                      <td className="px-6 py-3 border">
                        {new Date(document.uploaded_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 border">
                        {Object.entries(document.document_fields).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))}
                      </td>
                      <td className="p-3 flex justify-center">
                        {getCertificateByDocumentId(document.document_id) ? (
                          <button
                            onClick={() => handleViewCertificate(document.document_id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-500">Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-3 border text-center">
                      No completed applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedApplicationsList;
