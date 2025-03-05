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
        .get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/list`)
        .then((response) => {
          const allDocuments = response.data.documents;
          // Filter documents where status is "Completed"
          const filteredDocs = allDocuments
            .filter((doc) => doc.user_id === userId && doc.status === "Completed")
            .reverse(); // Show newest first
          setDocuments(filteredDocs);
        })
        .catch((error) => console.error("Error fetching documents:", error));

      axios
        .get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates")
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
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/download-certificate/${documentId}`,
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[310px] flex-shrink-0">{/* <Sidebar /> */}</div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 mt-5 overflow-hidden">
        <div className="w-full bg-white p-6">
          {/* Header with Search */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Completed Applications</h1>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>

          {/* Table Container with Scroll */}
          <div className="w-full max-h-[75vh] overflow-y-auto border border-gray-300">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead className="bg-gray-300">
                <tr>
                  <th className="border p-3">S.No</th>
                  <th className="border p-3">Application ID</th>
                  {/* <th className="border p-3">Document ID</th> */}
                  <th className="border p-3">Category</th>
                  <th className="border p-3">Subcategory</th>
                  <th className="border p-3">Name</th>
                  <th className="border p-3">Email</th>
                  {/* <th className="border p-3">Phone</th> */}
                  {/* <th className="border p-3">Address</th> */}
                  {/* <th className="border p-3">Document Fields</th> */}
                  <th className="border p-3">Documents</th>
                  <th className="border p-3">Verification</th>
                  <th className="border p-3">Certificate</th>
                  <th className="border p-3">Download Certificate</th>

                  <th className="border p-2 font-bold">Generate Error Request</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter((doc) =>
                    `${doc.document_id} ${doc.category_name} ${doc.subcategory_name} ${doc.name} ${doc.email} ${doc.phone} ${doc.address}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((doc, index) => (
                    <tr key={doc.document_id} className="border-t hover:bg-gray-100">
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2 text-center">{doc.application_id}</td>
                      {/* <td className="border p-2 text-center">{doc.document_id}</td> */}
                      <td className="border p-2">{doc.category_name}</td>
                      <td className="border p-2">{doc.subcategory_name}</td>
                      <td className="border p-2">{doc.name}</td>
                      <td className="border p-2">{doc.email}</td>
                      {/* <td className="border p-2">{doc.phone}</td> */}
                      {/* <td className="border p-2">{doc.address}</td> */}
                      {/* <td className="border p-2">
                        {Object.entries(doc.document_fields).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </td> */}
                      <td className="border p-2">
                        <div className="flex justify-center">
                          {doc.documents &&
                            doc.documents.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(file.file_path, "_blank", "width=800,height=600");
                                }}
                              >
                                <FaFileAlt className="text-blue-500 text-xl" />
                              </a>
                            ))}
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <span className="px-3 py-1 rounded-full text-white text-sm bg-blue-500 flex justify-center">
                          Completed
                        </span>
                      </td>
                      <td className="p-3 flex justify-center">
                        {getCertificateByDocumentId(doc.document_id) ? (
                          <button
                            onClick={() => handleViewCertificate(doc.document_id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-500 text-center">Not Available</span>
                        )}
                      </td>



                      <td className="border p-2 text-center">
                        {getCertificateByDocumentId(doc.document_id) ? (
                          <button
                            onClick={() => handleDownloadCertificate(doc.document_id, doc.name)}
                            className="bg-green-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-green-600 transition"
                          >
                            <FaDownload className="mr-1" /> Download
                          </button>
                        ) : (
                          <span className="text-gray-500 text-center">Not Available</span>
                        )}
                      </td>


                      <td className="border p-2 text-center">
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
                            )
                          }
                          className="bg-yellow-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-yellow-600 transition"
                        >
                          <FaExclamationTriangle className="mr-1" /> Error Request
                        </button>
                      </td>
                    </tr>
                  ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      No completed documents found.
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

export default CustomerHistory;
