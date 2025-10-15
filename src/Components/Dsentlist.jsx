import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileInvoice, FaDownload, FaTimes } from "react-icons/fa"; // Document icon
import jwtDecode from "jwt-decode"; // JWT decoder
import Swal from "sweetalert2"; // Popup notifications
import { useNavigate } from "react-router-dom";
const Dsentlist = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [distributorId, setDistributorId] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Decode token and extract user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId =
          decodedToken.user_id || decodedToken.id || decodedToken.user;
        if (userId) {
          setDistributorId(userId);
          fetchDocuments(userId);
          fetchCertificates(); // Fetch certificates after fetching documents
        } else {
          console.error("User ID is missing in the decoded token.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("Token is missing.");
    }
  }, []);

  // Fetch documents by distributor ID
  const fetchDocuments = async (distributorId) => {
    try {
      const response = await axios.get(
        ` http://72.60.206.65:3000/documents/list/${distributorId}`
      );

      // Filter documents with status "Sent" and sort by `uploaded_at` in descending order
      const filteredDocuments = response.data.documents
        .filter((doc) => doc.status === "Sent" || doc.status === "Received" ) // Only include documents with status "Sent"
        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)); // Sort by most recent

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      console.log("Fetching certificates...");
      const response = await axios.get(" http://72.60.206.65:3000/certificates"); // Adjust URL if needed
      console.log("Certificates API Response:", response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // Get certificate by document_id
  const getCertificateByDocumentId = (documentId) => {
    return certificates.find((cert) => cert.document_id === documentId);
  };

  // View certificate
  const handleViewCertificate = async (documentId) => {
    const certificate = getCertificateByDocumentId(documentId);
    if (!certificate) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }

    // Open the link first before fetching data (avoids popup blocker)
    const newTab = window.open("", "_blank");

    try {
      console.log(
        `Fetching certificate for Certificate ID: ${certificate.certificate_id}`
      );
      const response = await axios.get(
        ` http://72.60.206.65:3000/certificates/${certificate.certificate_id}`
      );
      console.log("View Certificate API Response:", response.data);

      if (response.data && response.data.file_url) {
        newTab.location.href = response.data.file_url; // Set the URL in the new tab
      } else {
        newTab.close(); // Close the tab if no file is found
        Swal.fire("Error", "Certificate not found.", "error");
      }
    } catch (error) {
      newTab.close(); // Close the tab if an error occurs
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Distributorinvoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/Distributorview/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      // Extract the file extension from the URL (e.g., "pdf", "jpg", "png")
      const fileExtension = receiptUrl.split(".").pop().toLowerCase();

      // Generate the file name (e.g., "MyDocument_receipt.pdf")
      const fileName = `${documentName}_receipt.${fileExtension}`;

      // Create a temporary <a> element to trigger the download
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName; // Set the file name for the download
      link.style.display = "none"; // Hide the link element
      document.body.appendChild(link); // Add the link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up by removing the link
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire(
        "Error",
        "Failed to download receipt. Please try again.",
        "error"
      );
    }
  };

  const handleDownloadCertificate = async (documentId, name) => {
    try {
      const response = await axios.get(
        ` http://72.60.206.65:3000/download-certificate/${documentId}`,
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
  const renderCertificateCell = (doc) => {
    const certificate = getCertificateByDocumentId(doc.document_id);

    if (certificate) {
      return (
        <button
          onClick={() => handleViewCertificate(doc.document_id)}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
        >
          View Certificate
        </button>
      );
    } else {
      return <span className="text-gray-500">No Certificate</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="ml-[300px] flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Receipt Uploaded Applications
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
        <div className=" overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "Application Id",
                  "Application Name",
                  "DateTime",
                  "Category",
                  "Subcategory",
                  "Verification",
                  "Actions",
                  "View",
                  " Receipt",
                  "Certificate",
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
              {documents.map((doc, index) => (
                <tr
                  key={doc.document_id}
                  className={`border border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"
                  }`}
                >
                  <td className="border p-3 text-center">
                    {doc.application_id}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {doc?.document_fields ? (
                      Array.isArray(doc.document_fields) ? (
                        // New format (array of objects)
                        doc.document_fields.find(
                          (field) => field.field_name === "APPLICANT NAME"
                        ) ? (
                          <p>
                            {
                              doc.document_fields.find(
                                (field) => field.field_name === "APPLICANT NAME"
                              ).field_value
                            }
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            No applicant name available
                          </p>
                        )
                      ) : // Old format (object with key-value pairs)
                      doc.document_fields["APPLICANT NAME"] ? (
                        <p>{doc.document_fields["APPLICANT NAME"]}</p>
                      ) : (
                        <p className="text-gray-500">
                          No applicant name available
                        </p>
                      )
                    ) : (
                      <p className="text-gray-500">No fields available</p>
                    )}
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
                  <td className="border p-3 text-center">
                    {doc.category_name}
                  </td>
                  <td className="border p-3 text-center">
                    {doc.subcategory_name}
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
                            : doc.status === "Completed"
                            ? "bg-yellow-500" // Color for Completed
                            : "bg-blue-500" // Default color
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Latest Status Date and Time */}
                      {doc.status_history
                        ?.sort(
                          (a, b) =>
                            new Date(b.updated_at) - new Date(a.updated_at)
                        ) // Sort by latest date
                        .slice(0, 1) // Take the first entry (latest status)
                        .map((statusEntry, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {new Date(statusEntry.updated_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit", // Added seconds
                                hour12: true, // Use AM/PM
                              }
                            )}
                          </div>
                        ))}
                    </div>
                  </td>

                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleViewInvoice(doc.document_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-red-600 transition"
                    >
                      <FaFileInvoice className="mr-1" /> Action
                    </button>
                  </td>

                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleView(doc.document_id)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-indigo-600 transition"
                    >
                      <FaFileInvoice className="mr-1" /> View
                    </button>
                  </td>
                  <td className="border p-3 text-center">
                    {doc.receipt_url ? (
                      <button
                        onClick={() =>
                          handleDownloadReceipt(doc.receipt_url, doc.name)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                      >
                        <FaDownload className="mr-1" /> Download Receipt
                      </button>
                    ) : (
                      <span className="text-gray-500 text-center">
                        Not Available
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {renderCertificateCell(doc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dsentlist;
