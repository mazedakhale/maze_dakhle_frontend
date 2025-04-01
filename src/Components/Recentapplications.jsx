import React, { useEffect, useState } from 'react';
import { FaRegFileAlt, FaDownload, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortedApplications, setSortedApplications] = useState([]);
  const [sortOrder, setSortOrder] = useState(true); // true for ascending, false for descending
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('https://mazedakhale.in/documents/recent');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setApplications(data);
        setSortedApplications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Sort applications based on "Uploaded At"
  const sortApplications = () => {
    const sorted = [...applications].sort((a, b) => {
      const dateA = new Date(a.uploaded_at);
      const dateB = new Date(b.uploaded_at);
      return sortOrder ? dateA - dateB : dateB - dateA;
    });

    setSortedApplications(sorted);
    setSortOrder(!sortOrder); // Toggle the sort order for next click
  };

  // Handle View Action
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  // Handle View Certificate Action
  const handleViewCertificate = async (documentId) => {
    try {
      const response = await axios.get(`https://mazedakhale.in/certificates/${documentId}`);
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

  // Handle Download Certificate Action
  const handleDownloadCertificate = async (documentId, name) => {
    try {
      const response = await axios.get(
        `https://mazedakhale.in/download-certificate/${documentId}`,
        {
          responseType: "blob",
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${name}`;

      if (contentDisposition && contentDisposition.includes("filename=")) {
        fileName = contentDisposition
          .split("filename=")[1]
          .replace(/['"]/g, "");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="ml-[280px] mt-[90px] p-4 w-[calc(90%-300px)] overflow-x-auto">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="border-t-4 border-blue-500 bg-[#E3F2FD] text-center p-4 rounded-t-lg relative">
          <h2 className="text-2xl font-bold text-gray-900">View Recent Applications</h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#E3F2FD] border-b-2 border-gray-400">
              <tr>
                {[
                  "#",
                  "Application ID",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone No",
                  "Applicant Name",
                  "Status",
                  "View",
                  "Certificate",
                  "Download Certificate",
                ].map((header, index) => (
                  <th key={index} className="px-4 py-3 border border-gray-400 text-black font-semibold text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedApplications.length > 0 ? (
                sortedApplications.map((app, index) => (
                  <tr
                    key={app.document_id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#E3F2FD]"}  transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-gray-400 text-center">{index + 1}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.application_id}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      {new Date(app.uploaded_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.category_name}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.subcategory_name}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.name}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.email}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">{app.phone}</td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      {app.document_fields ? (
                        Array.isArray(app.document_fields) ? (
                          app.document_fields.find((field) => field.field_name === "APPLICANT NAME") ? (
                            <p>{app.document_fields.find((field) => field.field_name === "APPLICANT NAME").field_value}</p>
                          ) : (
                            <p className="text-gray-500">No applicant name available</p>
                          )
                        ) : app.document_fields["APPLICANT NAME"] ? (
                          <p>{app.document_fields["APPLICANT NAME"]}</p>
                        ) : (
                          <p className="text-gray-500">No applicant name available</p>
                        )
                      ) : (
                        <p className="text-gray-500">No fields available</p>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${app.status === "Approved"
                          ? "bg-green-500"
                          : app.status === "Rejected"
                            ? "bg-red-500"
                            : app.status === "Pending"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      <button
                        onClick={() => handleView(app.document_id, app.category_id, app.subcategory_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-sm"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      {app.certificate_id ? (
                        <button
                          onClick={() => handleViewCertificate(app.document_id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                        >
                          Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-400 text-center">
                      {app.certificate_id ? (
                        <button
                          onClick={() => handleDownloadCertificate(app.document_id, app.name)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="px-4 py-3 border border-gray-400 text-center">
                    No recent applications found.
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

export default RecentApplications;