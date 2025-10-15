import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaRegFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Rejecteddocuments = () => {
  const [distributors, setDistributors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch assigned documents from the new API
    axios
      .get(`http://localhost:3000/documents/list`)
      .then((response) => {
        const sortedDocuments = response.data.documents.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setDocuments(sortedDocuments);
      })
      .catch((error) =>
        console.error("Error fetching assigned documents:", error)
      );

    // Fetch distributors
    axios
      .get(`http://localhost:3000/users/distributors`)
      .then((response) => setDistributors(response.data))
      .catch((error) => console.error("Error fetching distributors:", error));

    // Fetch certificates
    axios
      .get("http://localhost:3000/certificates")
      .then((response) => setCertificates(response.data))
      .catch((error) => console.error("Error fetching certificates:", error));

    // Fetch users
    axios
      .get("http://localhost:3000/users/register")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Update document status
  const handleUpdateStatus = async (documentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/documents/update-status/${documentId}`,
        {
          status: newStatus,
        }
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.document_id === documentId ? { ...doc, status: newStatus } : doc
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const filteredDocuments = documents
    .filter((doc) => doc.status === "Rejected") // only rejected
    .filter((doc) => !doc.distributor_id) // only those without distributor_id
    .filter((doc) =>
      statusFilter
        ? doc.status.toLowerCase() === statusFilter.toLowerCase()
        : true
    )
    .filter((doc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.application_id.toString().toLowerCase().includes(q) ||
        doc.name?.toLowerCase().includes(q) ||
        doc.email?.toLowerCase().includes(q) ||
        doc.category_name?.toLowerCase().includes(q) ||
        doc.subcategory_name?.toLowerCase().includes(q)
      );
    });

  const getDistributorName = (distributorId) => {
    const distributor = users.find(
      (user) => Number(user.user_id) === Number(distributorId)
    );
    return distributor ? distributor.name : "";
  };

  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Invoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
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
      alert("Certificate not found.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:3000/certificates/${certificateId}`
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
      console.log(
        "Downloading file for documentId:",
        documentId,
        "with name:",
        name
      ); // Debugging

      // Make the API call to download the file
      const response = await axios.get(
        `http://localhost:3000/download-certificate/${documentId}`,
        {
          responseType: "blob", // Important to handle file downloads
        }
      );

      console.log("API Response:", response); // Debugging

      // Extract the file name and extension from the response headers
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${name}`; // Default file name

      if (contentDisposition && contentDisposition.includes("filename=")) {
        // Extract the file name from the Content-Disposition header
        fileName = contentDisposition
          .split("filename=")[1]
          .replace(/['"]/g, ""); // Remove quotes
      }

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download initiated successfully"); // Debugging
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
    }
  };
  const handleReupload = async (documentId, documentType) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("documentType", documentType);

          const response = await axios.post(
            `http://localhost:3000/documents/reupload/${documentId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Reupload successful:", response.data);
          alert("Document reuploaded successfully.");

          const updatedDocuments = documents.map((doc) =>
            doc.document_id === documentId ? response.data.document : doc
          );
          setDocuments(updatedDocuments);
        } catch (error) {
          console.error("Error reuploading document:", error);
          let errorMessage = "Failed to reupload document. Please try again.";
          if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.request) {
            errorMessage = "Network error. Please check your connection.";
          }
          alert(errorMessage);
        }
      }
    };

    fileInput.click();
  };
  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Rejected Applications
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

        {/* Filters */}
        <div className="p-4 flex justify-between items-center bg-gray-100 border-b border-gray-300">
          <div className="flex items-center space-x-4">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            >
              <option value="">All</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64 text-sm"
          />
        </div>

        <div className="table-container border border-gray-300 rounded-lg shadow-md overflow-x-auto p-6">
          <table className="table border-collapse border border-gray-300 min-w-full text-sm">
            <thead className="bg-gray-300">
              <tr>
                <th className="border p-2 text-center font-bold">Sr No.</th>
                <th className="border p-2 text-center font-bold">
                  Application Id
                </th>
                <th className="border p-2 text-center font-bold">Datetime</th>

                <th className="border p-2 text-center font-bold">
                  Applicants Name
                </th>

                <th className="border p-2 font-bold">Category</th>
                <th className="border p-2 font-bold">Subcategory</th>
                <th className="border p-2 font-bold">VLE Name</th>
                <th className="border p-2 font-bold">VLE Email</th>
                <th className="border p-2 font-bold">VLE Phone no</th>
                <th className="border p-2 font-bold">Assigned Distributor</th>
                <th className="border p-2 font-bold">Verification</th>
                {/* <th className="border p-2 font-bold">Completed</th> */}
                <th className="border p-2 font-bold">Action</th>
                <th className="border p-2 font-bold">View</th>
                <th className="border p-2 font-bold">Rejecetd Reason</th>
                {/* <th className="border p-2 font-bold">Reupload</th> */}

                {/* <th className="border p-2 font-bold">Certificate</th>
                                                <th className="border p-2 font-bold">Download Certificate</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => (
                <tr
                  key={doc.document_id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-center">
                    {doc.application_id}
                  </td>
                  <td className="border p-2 text-center">
                    {(() => {
                      const date = new Date(doc.uploaded_at);
                      const formattedDate = `${String(date.getDate()).padStart(
                        2,
                        "0"
                      )}-${String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      )}-${date.getFullYear()}`;
                      const formattedTime = date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      });
                      return (
                        <>
                          <div>{formattedDate}</div>
                          <div className="text-sm text-gray-600">
                            {formattedTime}
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {(() => {
                      const fields = doc.document_fields;
                      let name = null;

                      if (Array.isArray(fields)) {
                        // array case
                        const found = fields.find(
                          (f) => f.field_name === "APPLICANT NAME"
                        );
                        name = found?.field_value;
                      } else if (fields && typeof fields === "object") {
                        // object/map case
                        name = fields["APPLICANT NAME"];
                      }

                      return name ? (
                        <span>{name}</span>
                      ) : (
                        <span className="text-gray-500">
                          No applicant name available
                        </span>
                      );
                    })()}
                  </td>

                  <td className="border p-2">{doc.category_name}</td>
                  <td className="border p-2">{doc.subcategory_name}</td>
                  <td className="border p-2">{doc.name}</td>
                  <td className="border p-2 break-words">{doc.email}</td>
                  <td className="border p-2 break-words">{doc.phone}</td>

                  <td className="border p-2">
                    {getDistributorName(doc.distributor_id)}
                  </td>
                  <td className="border p-2">
                    <div className="flex flex-col gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs ${
                          doc.status === "Approved"
                            ? "bg-green-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : doc.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Latest Status Date and Time */}
                      {doc.status_history
                        ?.sort(
                          (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                        )
                        .slice(0, 1)
                        .map((statusEntry, index) => {
                          const dateObj = new Date(statusEntry.updated_at);
                          const day = String(dateObj.getDate()).padStart(
                            2,
                            "0"
                          );
                          const month = String(dateObj.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const year = dateObj.getFullYear();
                          const time = dateObj.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          });

                          return (
                            <div key={index} className="text-xs text-gray-600">
                              {`${day}-${month}-${year} ${time}`}
                            </div>
                          );
                        })}
                    </div>
                  </td>
                  {/* <td className="border p-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(doc.document_id, "Completed")}
                                                            className="bg-blue-900 rounded flex justify-center items-center hover:bg-blue-600 px-3 py-1 text-white text-xs"
                                                        >
                                                            <FaCheck className="text-white" />
                                                        </button>
                                                    </td> */}
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleViewInvoice(doc.document_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-red-600 transition text-xs"
                    >
                      <FaFileInvoice className="mr-1" /> Action
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        handleView(
                          doc.document_id,
                          doc.category_id,
                          doc.subcategory_id
                        )
                      }
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-xs"
                    >
                      <FaRegFileAlt className="mr-1" /> View
                    </button>
                  </td>
                  <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                    {doc.rejection_reason}
                  </td>
                  {/* <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                        {doc.status === "Rejected" && doc.selected_document_names ? (
                                            doc.selected_document_names.map((documentType, idx) => (
                                                <div key={idx} className="flex items-center justify-between mb-2">
                                                    <span className="text-xs">{documentType}</span>
                                                    <button
                                                        onClick={() => handleReupload(doc.document_id, documentType)}
                                                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                                                    >
                                                        Reupload
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            "N/A"
                                        )}
                                    </td> */}
                  {/* <td className="border p-2 text-center">
                                                        {getCertificateByDocumentId(doc.document_id) ? (
                                                            <button
                                                                onClick={() => handleViewCertificate(doc.document_id)}
                                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                                                            >
                                                                <FaCheck className="mr-1" /> Certificate
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-500">Not Available</span>
                                                        )}
                                                    </td>
                                                    <td className="border p-2 text-center">
                                                        {getCertificateByDocumentId(doc.document_id) ? (
                                                            <button
                                                                onClick={() => handleDownloadCertificate(doc.document_id, doc.name)}
                                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-xs"
                                                            >
                                                                <FaDownload className="mr-1" /> Download
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-500">Not Available</span>
                                                        )}
                                                    </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rejecteddocuments;
