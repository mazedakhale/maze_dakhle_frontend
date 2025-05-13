import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const CompletedApplicationsList = () => {
  const [userId, setUserId] = useState(null);
  const [completedDocuments, setCompletedDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.user_id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCompletedDocuments = async () => {
      try {
        const response = await axios.get(
          `https://mazedakhale.in/api/userdashboard/completed/${userId}`
        );
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
        const response = await axios.get(
          "https://mazedakhale.in/api/certificates"
        );
        setCertificates(response.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };

    fetchCompletedDocuments();
    fetchCertificates();
  }, [userId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = completedDocuments.filter((document) => {
    return Object.values(document).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => String(cert.document_id) === String(documentId)
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
        `https://mazedakhale.in/api/certificates/${certificateId}`
      );

      if (response.data && response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        alert("Certificate file not available.");
      }
    } catch (error) {
      alert("Failed to fetch certificate.");
    }
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Completed Applications List
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
        <div className="p-4 flex justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            {/* Table Header */}
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "Document ID",
                  "Category",
                  "Subcategory",
                  "Email",
                  "Status",
                  "Uploaded At",
                  "Applicant name",
                  "Certificate",
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

            {/* Table Body */}
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document, index) => (
                  <tr
                    key={document.document_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.document_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.category_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.subcategory_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document.email}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          document.status === "Approved"
                            ? "bg-green-500"
                            : document.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {new Date(document.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {document?.document_fields ? (
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

                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {getCertificateByDocumentId(document.document_id) ? (
                        <button
                          onClick={() =>
                            handleViewCertificate(document.document_id)
                          }
                          className="bg-blue-500 text-white px-3 py-2 rounded flex items-center justify-center hover:bg-blue-600 transition"
                        >
                          <FaFileAlt className="mr-1" /> View
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No completed applications found.
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

export default CompletedApplicationsList;
