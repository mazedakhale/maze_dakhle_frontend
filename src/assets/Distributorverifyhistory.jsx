import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileInvoice,FaDownload } from "react-icons/fa"; // Document icon
import jwtDecode from "jwt-decode"; // JWT decoder
import Swal from "sweetalert2"; // Popup notifications
import { useNavigate } from "react-router-dom"; 

const VerifyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [distributorId, setDistributorId] = useState(null);
  const navigate = useNavigate();

  // Decode token and extract user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id || decodedToken.id || decodedToken.user;
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
        `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/list/${distributorId}`
      );

      const filteredDocuments = response.data.documents.filter(
        (doc) => doc.status === "Uploaded" || doc.status === "Completed" || doc.status === "Distributor Rejected"
      );

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      console.log("Fetching certificates...");
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates"); // Adjust URL if needed
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
      console.log(`Fetching certificate for Certificate ID: ${certificate.certificate_id}`);
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/certificates/${certificate.certificate_id}`);
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
    navigate(`/Distributorinvoice/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/Distributorview/${documentId}`, { state: { categoryId, subcategoryId } });
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




  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-md rounded-lg">
        <div className="bg-[#f5f0eb] border-t-4 shadow-md rounded border-orange-400 p-4">
          <h2 className="text-xl font-bold text-center text-gray-800">
            Manage Distributor History
          </h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#f5f0eb]">
              <tr>
                {[
                  "Application Id",
                  "Category",
                  "Subcategory",
                  "Verification",
                  "Actions",
                  "View",
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
              {documents.map((doc, index) => (
                <tr
                  key={doc.document_id}
                  className={`border border-gray-300 ${
                    index % 2 === 0 ? "bg-[#fffaf4]" : "bg-white"
                  }`}
                >
                  <td className="border p-3 text-center">{doc.application_id}</td>
                  <td className="border p-3 text-center">{doc.category_name}</td>
                  <td className="border p-3 text-center">{doc.subcategory_name}</td>
  
                  <td className="border p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        doc.status === "Processing"
                          ? "bg-orange-500"
                          : doc.status === "Rejected"
                          ? "bg-red-500"
                          : doc.status === "Uploaded"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {doc.status}
                    </span>
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
  
                  <td className="border px-4 py-2 text-center">
                    {["Uploaded", "Completed"].includes(doc.status) &&
                    getCertificateByDocumentId(doc.document_id) ? (
                      <button
                        onClick={() => handleViewCertificate(doc.document_id)}
                        className="bg-[#F58A3B] text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        View Certificate
                      </button>
                    ) : (
                      <span className="text-gray-500">No Certificate</span>
                    )}
                  </td>
  
                  <td className="border p-3 text-center">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}  

export default VerifyDocuments;
