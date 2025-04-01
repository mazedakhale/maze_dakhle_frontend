import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';
import logo1 from '../assets/logo.png';
import jwtDecode from 'jwt-decode';
import { FaUserCircle, FaDownload } from 'react-icons/fa';
import Draggable from "react-draggable";
import { useRef } from "react";




const InvoicePage = () => {
  const { documentId } = useParams();
  const location = useLocation();
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } = location.state || {};
  const [certificates, setCertificates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentData, setDocumentData] = useState(null);
  const [documentNames, setDocumentNames] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [showDistributorList, setShowDistributorList] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [checkedDocs, setCheckedDocs] = useState({});
  const [openContainer, setOpenContainer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nodeRef = useRef(null);

  const filteredDistributors = distributors.filter((dist) =>
    dist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (userId) => {
    setSelectedDistributor(userId === selectedDistributor ? null : userId);
  };

  const handleSaveClick = (userId) => {
    handleAssignDistributor(userId);
    // setSelectedDistributor(null);
    // alert("Distributor selected successfully!");
  };



  useEffect(() => {
    axios
      .get("https://https://mazedakhale.in/users/distributors")
      .then((response) => setDistributors(response.data))
      .catch((error) => console.error("Error fetching distributors:", error));
  }, []);

  useEffect(() => {
    console.log("Fetched from previous page state:");
    console.log("Document ID:", documentId);
    console.log("Category ID:", stateCategoryId);
    console.log("Subcategory ID:", stateSubcategoryId);
  }, [documentId, stateCategoryId, stateSubcategoryId]);



  const handleDocumentClick = (filePath, index) => {
    setSelectedDocument(filePath); // Show the document
    setCheckedDocs((prev) => ({ ...prev, [index]: true })); // Check the checkbox
  };
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === "Rejected" && !rejectionReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      await axios.put(`https://https://mazedakhale.in/documents/update-status/${documentId}`, {
        status: newStatus,
        rejectionReason: newStatus === "Rejected" ? rejectionReason : undefined,
      });

      setDocumentData((prev) => ({ ...prev, status: newStatus }));
      alert(`Status updated to ${newStatus}`);

      // Reset the rejection input field after sending
      setShowRejectionInput(false);
      setRejectionReason('');
      // setRejectionReason("");
      setOpenContainer(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };


  // Add this function inside your InvoicePage component
  const handleDownloadAllDocuments = async () => {
    try {
      // Show loading indicator
      setIsLoading(true);
      const loadingToast = Swal.fire({
        title: "Preparing download...",
        text: "Please wait while we prepare your documents. This may take a moment.",
        icon: "info",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Make the API call to download the ZIP file with increased timeout
      const response = await axios.get(`https://https://mazedakhale.in/download/${documentId}`, {
        responseType: 'blob', // Handle binary data
        timeout: 60000, // Increase timeout to 60 seconds
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            Swal.update({
              title: "Downloading...",
              text: `${percentCompleted}% complete`,
            });
          }
        }
      });

      // Close the loading toast
      loadingToast.close();

      // Extract the filename from Content-Disposition header
      let filename = '';
      const contentDisposition = response.headers['content-disposition'];

      if (contentDisposition) {
        // Extract filename from Content-Disposition header
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          // Remove quotes if present
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      if (!filename) {
        // Try to get applicant name from document_fields if available
        let applicantName = '';

        // Safely check if document_fields exists and is an array
        if (documentData &&
          documentData.document_fields &&
          Array.isArray(documentData.document_fields)) {

          const applicantField = documentData.document_fields.find(
            field => field.field_name === 'APPLICANT NAME'
          );

          if (applicantField && applicantField.field_value) {
            applicantName = applicantField.field_value;
          }
        }

        // If applicant name was found, use it for the filename
        if (applicantName) {
          filename = `${applicantName.replace(/\s+/g, '_')}.zip`;
        } else {
          // Use "Document_ID" when applicant name isn't available
          filename = `Document_${documentId}.zip`;
        }
      }

      // Create a temporary URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a hidden anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up the DOM and revoke the object URL
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success notification
      Swal.fire({
        title: "Success",
        text: "Documents downloaded successfully!",
        icon: "success",
      });
    } catch (error) {
      console.error('Error downloading documents:', error);

      // Show error notification with detailed message
      let errorMessage = "Failed to download documents. Please try again.";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Download timed out. The file might be too large or the server is busy. Please try again later.";
      } else if (error.response) {
        // Check if the response is a blob that contains error information
        if (error.response.data instanceof Blob && error.response.data.type === 'application/json') {
          try {
            // Read the blob as text and parse it as JSON
            const errorText = await new Response(error.response.data).text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        } else if (error.response.status === 404) {
          errorMessage = "No documents found for download.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Handle network errors
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Handle other unexpected errors
        errorMessage = error.message || errorMessage;
      }

      // Show error notification
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      // Hide loading indicator
      setIsLoading(false);
    }
  };


  const handleAssignDistributor = async (distributorId) => {
    if (!distributorId) return;
    try {
      await axios.put(`https://https://mazedakhale.in/documents/assign-distributor/${documentId}`, {
        distributor_id: distributorId,
      });
      setDocumentData((prev) => ({ ...prev, distributor_id: distributorId }));
      alert("Distributor assigned successfully!");
      setShowDistributorList(false);
      setOpenContainer(null);
      setSelectedDistributor(null);
    } catch (error) {
      console.error("Error assigning distributor:", error);
      alert("Failed to assign distributor.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserEmail(decodedToken.email);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/Login";
  };


  const fetchCertificates = async () => {
    try {
      console.log("Fetching certificates...");
      const response = await axios.get("https://https://mazedakhale.in/certificates", {
        timeout: 30000
      }); console.log("Certificates API Response:", response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  }
  const fetchDocumentData = useCallback(async () => {
    try {
      const response = await axios.get(`https://https://mazedakhale.in/singledocument/documentby/${documentId}`);
      const data = response.data.document;
      setDocumentData(data);

      const category = stateCategoryId || data.category_id;
      const subcategory = stateSubcategoryId || data.subcategory_id;

      if (category && subcategory) {
        const fieldNamesResponse = await axios.get(`https://https://mazedakhale.in/field-names/${category}/${subcategory}`);
        setDocumentNames(fieldNamesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId, fetchDocumentData]);
  const handleDownloadReceipt = () => {
    if (!documentData?.receipt_url) {
      Swal.fire("Error", "No receipt available for download.", "error");
      return;
    }

    try {
      const fileExtension = documentData.receipt_url.split('.').pop().toLowerCase();
      const fileName = `${documentData.name || 'document'}_receipt.${fileExtension}`;

      const link = document.createElement("a");
      link.href = documentData.receipt_url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire("Error", "Failed to download receipt. Please try again.", "error");
    }
  };
  useEffect(() => {
    // Your existing code for fetching document data

    // Add this line to fetch certificates
    fetchCertificates();
  }, [documentId, fetchCertificates]);

  const handleReupload = async (documentId, documentType) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg';

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('documentType', documentType);

          const response = await axios.post(
            `https://https://mazedakhale.in/documents/reupload/${documentId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          console.log('Reupload successful:', response.data);
          alert('Document reuploaded successfully.');

          const updatedDocuments = documents.map((doc) =>
            documentData.document_id === documentId ? response.documentData.document : doc
          );
          setDocuments(updatedDocuments);
        } catch (error) {
          console.error('Error reuploading document:', error);
          let errorMessage = 'Failed to reupload document. Please try again.';
          if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
          }
          alert(errorMessage);
        }
      }

    };

    fileInput.click();
  };

  if (!documentData) return <div className="text-center text-lg mt-10">Loading Invoice...</div>;

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">

      <nav className="flex items-center justify-between bg-[#00234E] text-white p-4 shadow-md fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo1} alt="Logo" className="h-10 mr-3" />
          <span className="text-xl font-bold">Vendor Management System</span>
        </div>

        {/* Profile Icon */}
        <div className="relative">
          <FaUserCircle
            className="h-10 w-10 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-10">
              <div className="p-4 border-b text-center">
                {userEmail ? (
                  <p className="text-sm font-medium">{userEmail}</p>
                ) : (
                  <p className="text-sm">No user logged in.</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>


      {/* Header with Logo */}
      <div className="w-full flex items-center justify-between border-b mt-6 pb-4 mb-4">
        {/* <img src={logo1} alt="Logo" className="h-12" /> */}

        {/* <div className="text-gray-600 text-sm">{new Date().toLocaleDateString()}</div> */}


      </div>

      <div className="flex space-x-6">
        {/* Left Side - Scrollable Form */}
        <div className="w-4/5 border-r pr-6 h-[700px] overflow-y-auto">
          <div className="flex justify-center items-center p-0">
            {/* Main Form Container with Increased Width */}
            <div className="w-full border rounded-lg shadow-lg p-6 bg-white">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-4">
                {/* Logo on the left */}
                <img src={logo1} alt="Logo" className="w-24 h-24 object-contain" />

                {/* Title and Date/Application ID */}
                <div className="text-center flex-1">
                  <h2 className="text-3xl font-bold text-gray-700">Application Details</h2>
                </div>

                {/* Date and Application ID */}
                <div className="text-right">
                  <table className="text-sm text-gray-700 border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="font-semibold pr-2 border-r border-gray-300 p-2">Date:</td>
                        <td className="p-2">{new Date(documentData.uploaded_at).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-2 border-r border-gray-300 p-2">Application ID:</td>
                        <td className="p-2">{documentData.application_id}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Horizontal Line */}
              <hr className="border-gray-400 mb-6" />

              {/* Category Header */}
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Application for {documentData.category_name}
              </h3>

              {/* Fields in Key-Value Format (Two per line, no border) */}
              <table className="w-full border border-gray-300 mb-6">
                <tbody>
                  {[{ label: "Application ID", value: documentData.application_id },
                  // { label: "User ID", value: documentData.user_id },
                  { label: "Category", value: documentData.category_name },
                  { label: "Subcategory", value: documentData.subcategory_name },
                  // { label: "Name", value: documentData.name },
                  // { label: "Email", value: documentData.email },
                  // { label: "Phone", value: documentData.phone },
                  {
                    label: "Status",
                    value: (
                      <div className="flex flex-col ">
                        {/* Status */}
                        <span
                          className={`px-8 py-2 rounded-full text-white text-xs w-[150px] ${documentData.status === "Approved"
                            ? "bg-green-500"
                            : documentData.status === "Rejected"
                              ? "bg-red-500"
                              : documentData.status === "Completed"
                                ? "bg-yellow-500" // Color for Completed
                                : "bg-blue-500" // Default color
                            }`}
                        >
                          {documentData.status}
                        </span>

                        {/* Latest Status Date and Time */}
                        {documentData.status_history
                          ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Sort by latest date
                          .slice(0, 1) // Take the first entry (latest status)
                          .map((statusEntry, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {new Date(statusEntry.updated_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit", // Added seconds
                                hour12: true, // Use AM/PM
                              })}
                            </div>
                          ))}
                      </div>
                    ),
                  }                // { label: "Address", value: documentData.address },
                    // { label: "Distributor", value: documentData.distributor_id || 'Not Assigned' }
                  ].reduce((rows, field, index, array) => {
                    if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                    return rows;
                  }, []).map((pair, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      {pair.map((field, index) => (
                        <React.Fragment key={index}>
                          <td className="p-3 font-semibold border-r border-gray-300 w-1/6" style={{ backgroundColor: '#FFB4A2' }}>
                            {field.label}
                          </td>
                          <td className="p-3 border-r border-gray-300">{field.value || 'N/A'}</td>
                        </React.Fragment>
                      ))}
                      {pair.length < 2 && (
                        <>
                          <td className="p-3 border-r border-gray-300" style={{ backgroundColor: '#FFCDB2' }}></td>
                          <td className="p-3 border-r border-gray-300"></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-2xl text-gray-700 font-semibold mb-4">Document Fields</h3>
              <table className="w-full table-fixed border border-gray-300">
                <tbody>
                  {(() => {
                    // Handle both array format and object format
                    let fieldsArray = [];

                    if (Array.isArray(documentData.document_fields)) {
                      // New format (array of objects with field_name and field_value)
                      fieldsArray = documentData.document_fields.map(field => [
                        field.field_name,
                        field.field_value
                      ]);
                    } else if (typeof documentData.document_fields === 'object' && documentData.document_fields !== null) {
                      // Old format (object with key-value pairs)
                      fieldsArray = Object.entries(documentData.document_fields);
                    } else {
                      fieldsArray = [];
                    }

                    return fieldsArray
                      .reduce((rows, field, index, array) => {
                        if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                        return rows;
                      }, [])
                      .map((pair, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          {pair.map(([key, value], index) => (
                            <React.Fragment key={index}>
                              <td className="w-1/5 p-3 font-semibold border-r border-gray-300 bg-white">{key}</td>
                              <td className="w-1/3 p-3 border-r border-gray-300">{value || 'N/A'}</td>
                            </React.Fragment>
                          ))}
                          {pair.length < 2 && (
                            <>
                              <td className="w-1/5 p-3 bg-white border-r border-gray-300"></td>
                              <td className="w-1/3 p-3 border-r border-gray-300"></td>
                            </>
                          )}
                        </tr>
                      ));
                  })()}

                </tbody>
              </table>
            </div>
          </div>

        </div>    {/* Action Buttons */}

        {/* Right Side - Documents */}
        {/* <div className="w-1/2"> */}
        <div className="w-2/5 mx-auto p-6 bg-white shadow-md rounded-lg">
          <div className="mt-0 flex space-x-4 items-center">
            {/* Approve Button */}






          </div>







          {/* Section Heading */}
          <div className="w-2/2 mx-auto p-6 bg-white shadow-md rounded-lg">
            {/* Application Details Section */}
            <h2 className="text-2xl font-bold text-gray-700 mb-2 flex items-center">
              📋 Application Details
            </h2>
            <p className="text-lg text-gray-600">
              <strong>Name:</strong>{" "}
              <span className="font-semibold">{documentData.name}</span>
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Application ID:</strong> {documentData.application_id}
            </p>

            {/* Required Documents Table */}
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Attached Documents
            </h3>

            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 text-left border border-gray-300 w-1/12"></th>
                  <th className="p-2 text-left border border-gray-300">Name</th>
                  {/* <th className="p-2 text-left border border-gray-300">Info</th> */}
                </tr>
              </thead>
              <tbody>
                {documentData.documents?.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="p-2 border border-gray-300 text-center">
                      <input
                        type="checkbox"
                        checked={checkedDocs[index] || false}
                        onChange={() =>
                          setCheckedDocs((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      />
                    </td>

                    {/* Document Name (Clickable Link) */}
                    <td
                      className="p-2 border border-gray-300 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleDocumentClick(doc.file_path, index)}
                    >
                      {documentNames[doc.document_type] || doc.document_type}
                    </td>

                    {/* Info Column */}
                    {/* <td className="p-2 border border-gray-300">
                {doc.info || ""}
              </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download Button */}
          <div>
            <button
              onClick={handleDownloadAllDocuments}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center mt-[20px] ml-[20px]"
            >
              <FaDownload className="mr-2" />
              {isLoading ? "Downloading..." : "Download"}
            </button>


            {documentData.status === "Rejected" && documentData.selected_document_names ?
              (
                documentData.selected_document_names.map((documentType, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-2">
                    <span className="text-sm ml-[270px]">{documentType} </span>
                    <button
                      onClick={() => handleReupload(documentData.document_id, documentType)}
                      className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-xs"
                    >
                      add Document
                    </button>
                  </div>
                ))
              ) : (
                "N/A"
              )}
          </div>
          <td className="px-4 mt-[20px] py-3 border border-[#776D6DA8] text-center">
            Rejected Reason: {documentData.rejection_reason}
          </td>
          {/* Document Preview */}
          {/* Document Preview */}
          {/* Document Preview */}


          {selectedDocument && (
            <Draggable handle=".drag-handle" nodeRef={nodeRef}>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  ref={nodeRef}
                  className="relative w-3/4 md:w-2/3 lg:w-1/2 h-3/4 bg-gray-100 rounded-lg p-4 drag-handle cursor-move"
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
                    onClick={() => setSelectedDocument(null)}
                  >
                    &times;
                  </button>

                  {/* Document Title */}
                  <h3 className="text-xl font-medium mb-4 text-center">
                    Document Preview
                  </h3>

                  {/* Iframe Preview */}
                  <iframe
                    src={selectedDocument}
                    title="Document Preview"
                    className="w-full h-full border rounded"
                  />
                </div>
              </div>
            </Draggable>
          )}


        </div>
      </div>
      {/* Action Buttons */}

    </div>
  );
};
export default InvoicePage;
