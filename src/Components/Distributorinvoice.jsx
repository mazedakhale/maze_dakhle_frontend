import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaUserPlus, FaFileAlt } from 'react-icons/fa';
import logo1 from '../assets/logo.png';
import jwtDecode from 'jwt-decode';
import { FaUserCircle, FaDownload } from 'react-icons/fa';
import Draggable from "react-draggable";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Swal from "sweetalert2";


const InvoicePage = () => {
  const { documentId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); // Define the state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const location = useLocation();
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } = location.state || {};
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState(null); // New state for file upload
  const [selectedReceiptFile, setSelectedReceiptFile] = useState(null); // State for receipt file
  const [previewReceiptFile, setPreviewReceiptFile] = useState(null); // State for receipt preview
  const nodeRef = useRef(null);
  const navigate = useNavigate(); // Use navigate instead of history
  const [isLoading, setIsLoading] = useState(false);


  // Handle receipt file selection
  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setSelectedReceiptFile(file);
      setPreviewReceiptFile(fileURL);
      setShowPreview(true);

    }
  };
  // Get certificate by document_id


  // View certificate

  // Handle receipt file cancellation
  const handleCancelReceiptFile = () => {
    if (previewReceiptFile) {
      URL.revokeObjectURL(previewReceiptFile);
    }
    setSelectedReceiptFile(null);
    setPreviewReceiptFile(null);
    setShowPreview(false);
  };
  const handleUploadReceipt = async () => {
    if (!selectedReceiptFile) {
      Swal.fire("Warning", "Please select a receipt file first", "warning");
      return;
    }

    // Allowed file types and size validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(selectedReceiptFile.type)) {
      Swal.fire("Error", "Only JPEG, PNG, and PDF files are allowed.", "error");
      return;
    }

    if (selectedReceiptFile.size > maxSize) {
      Swal.fire("Error", "File size must be less than 5 MB.", "error");
      return;
    }

    // Show a loading alert
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your receipt is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    formData.append("receipt", selectedReceiptFile);
    formData.append("document_id", documentId.toString());

    try {
      // Step 1: Upload the receipt
      const response = await axios.post(
        `https://https://mazedakhale.in/documents/upload-receipt/${documentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload Response:", response.data);

      // Step 2: Update the status to "Uploaded"
      await axios.put(
        `https://https://mazedakhale.in/documents/update-status/${documentId}`,
        { status: "Sent" },
        { timeout: 30000 }  // Increase timeout to 30 seconds
      );

      Swal.fire({
        title: "Success",
        text: "Receipt uploaded successfully!",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        navigate('/Distributorverify'); // Redirect to Distributor Verify page
      });

      handleCancelReceiptFile(); // Reset file input
    } catch (error) {
      console.error("Error uploading receipt:", error);
      console.error("Server response:", error.response?.data);

      Swal.fire({
        title: "Error",
        text: "Failed to upload receipt. Please try again.",
        icon: "error"
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewFile(fileURL);
      setShowPreview(true);
    }
  };

  const handleCancelFile = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setSelectedFile(null);
    setPreviewFile(null);
    setShowPreview(false);
  };

  const handleUploadCertificate = async () => {
    if (!selectedFile) {
      Swal.fire("Warning", "Please select a file first", "warning");
      return;
    }

    if (!documentData || !documentData.user_id || !documentData.distributor_id || !documentData.application_id || !documentData.name) {
      Swal.fire("Error", "Required document information is missing", "error");
      return;
    }

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we upload your certificate',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("document_id", documentId.toString());
    formData.append("user_id", documentData.user_id.toString());
    formData.append("distributor_id", documentData.distributor_id.toString());
    formData.append("application_id", documentData.application_id.toString());
    formData.append("name", documentData.name.toString());

    try {
      // Increased timeout
      const response = await axios.post(
        'https://https://mazedakhale.in/certificates/upload',
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // Timeout increased to 30 seconds
        }
      );

      Swal.fire({
        title: "Success",
        text: "Certificate uploaded successfully!",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        navigate('/Distributorverify');
      });

      handleCancelFile();
    } catch (error) {
      console.error("Error uploading certificate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to upload certificate. Please try again.",
        "error"
      );
    }
  };;


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
    setSelectedDocument(filePath);
    setShowDocumentViewer(true);
    setCheckedDocs((prev) => ({ ...prev, [index]: true }));
  };
  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true); // Set loading state to true

    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      alert('Please enter a reason for rejection.');
      setIsUpdatingStatus(false); // Reset loading state
      return;
    }

    try {
      const payload = {
        status: newStatus,
        rejectionReason: rejectionReason,
        selectedDocumentNames: documentData.documents
          .filter((_, index) => checkedDocs[index])
          .map((doc) => documentNames[doc.document_type] || doc.document_type),
      };

      // Show loading alert
      Swal.fire({
        title: "Updating Status...",
        text: "Please wait while we update the status.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.put(
        `https://https://mazedakhale.in/documents/update-status/${documentId}`,
        payload,
        { timeout: 30000 }
      );

      // Close loading alert
      Swal.close();

      // Show success message
      Swal.fire({
        title: "Success",
        text: "Status updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate('/Distributorverify'); // Redirect after success
      });
    } catch (error) {
      console.error('Error updating status:', error);

      // Show error message
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to update status. Please try again.",
        icon: "error",
      });
    } finally {
      setIsUpdatingStatus(false); // Reset loading state
    }
  };
  // Fetch certificates
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
  //   };const fetchCertificates = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get("https://https://mazedakhale.in/certificates", {
  //       timeout: 30000
  //     });
  //     setCertificates(response.data);
  //   } catch (error) {
  //     console.error("Error fetching certificates:", error);
  //     setCertificates([]); // Set empty array as fallback
  //     // Show user-friendly error
  //     toast.error("Could not load certificates. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Get certificate by document_id
  const getCertificateByDocumentId = (documentId) => {
    console.log("Looking for document ID:", documentId);
    console.log("Available certificates:", certificates);
    // Convert both to strings for comparison to avoid type issues
    return certificates.find((cert) => String(cert.document_id) === String(documentId));
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
      const response = await axios.get(`https://https://mazedakhale.in/certificates/${certificate.certificate_id}`);
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

      // If no filename was found in the header, use a fallback
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
  // Add these state variables
  const [certificates, setCertificates] = useState([]);

  // Fetch certificates


  // Download certificate
  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `https://https://mazedakhale.in/download-certificate/${documentId}`,
        {
          responseType: "blob",
        }
      );

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${documentData?.name || 'certificate'}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      Swal.fire("Error", "Failed to download certificate.", "error");
    }
  };
  // View certificate - updated to accept a document ID parameter

  // Download receipt
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

  useEffect(() => {
    // Your existing code for fetching document data

    // Add this line to fetch certificates
    fetchCertificates();
  }, [documentId, fetchCertificates]);

  if (!documentData) return <div className="text-center text-lg mt-10">Loading Invoice...</div>;
  // View certificate - updated to accept a document ID parameter
  // View certificate - updated to accept a document ID parameter
  // In your React component
  const DownloadAllDocuments = async () => {
    try {
      // Show loading indicator
      setIsLoading(true);

      // Add a loading notification with progress
      const loadingToast = Swal.fire({
        title: "Preparing download...",
        text: "Please wait while we prepare your documents, receipts, and certificates.",
        icon: "info",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Make the API call to download the ZIP file
      const response = await axios.get(
        `https://https://mazedakhale.in/download/all/${documentId}`,
        {
          responseType: "blob",
          timeout: 120000, // 2 minutes timeout
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              Swal.update({
                title: "Downloading...",
                text: `${percentCompleted}% complete`,
              });
            }
          }
        }
      );

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

      // If no filename was found in the header, use a fallback
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
          // Use "document" when applicant name isn't available
          filename = `Document_${documentId}.zip`;
        }
      }

      // Create a temporary URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a hidden anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up the DOM and revoke the object URL
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success notification
      Swal.fire({
        title: "Success",
        text: "Documents, receipts, and certificates downloaded successfully!",
        icon: "success",
      });
    } catch (error) {
      console.error("Error downloading:", error);

      // Show error notification with detailed message
      let errorMessage = "Download failed. Please try again.";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Download timed out. The files might be too large or the server is busy. Please try again later.";
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
          errorMessage = "No documents, receipts, or certificates found for download.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      // Show error notification
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
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
                onClick={handle}
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
                <h2 className="text-xl font-bold text-center text-gray-800">
                  Manage Distributor List
                </h2>

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
                  {[
                    { label: "Application ID", value: documentData.application_id },
                    //   { label: "User ID", value: documentData.user_id },
                    { label: "Category", value: documentData.category_name },
                    { label: "Subcategory", value: documentData.subcategory_name },
                    //   { label: "Name", value: documentData.name },
                    //   { label: "Email", value: documentData.email },
                    //   { label: "Phone", value: documentData.phone },
                    { label: "Status", value: documentData.status },
                    //   { label: "Address", value: documentData.address },
                    //   { label: "Distributor", value: documentData.distributor_id || 'Not Assigned' }
                  ].reduce((rows, field, index, array) => {
                    if (index % 2 === 0) {
                      rows.push(array.slice(index, index + 2));
                    }
                    return rows;
                  }, []).map((pair, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      {pair.map((field, index) => (
                        <React.Fragment key={index}>
                          <td className="p-3 font-semibold border-r border-gray-300 w-1/6" style={{ backgroundColor: '#F58A3B14' }}>
                            {field.label}
                          </td>
                          <td className="p-3 border-r border-gray-300">{field.value}</td>
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



              {/* Document Fields Section */}
              {/* Document Fields Section */}
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
        <div className="w-2/5 mx-auto p-6 bg-white shadow-md rounded-lg">
          {/* Application Details Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-2 flex items-center">
              📋 Application Details
            </h2>
            <p className="text-gray-600">
              <strong>Application ID:</strong> {documentData.application_id}
            </p>
          </div>

          {/* Attached Documents Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Attached Documents
            </h3>
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 text-left border border-gray-300 w-1/12"></th>
                  <th className="p-2 text-left border border-gray-300">Name</th>
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

                    {/* Document Name */}
                    <td
                      className="p-2 border border-gray-300 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleDocumentClick(doc.file_path, index)}
                    >
                      {documentNames[doc.document_type] || doc.document_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons Section */}
          <div className="flex space-x-4 mb-6">
            {/* Reject Button */}
            <button
              onClick={() => setOpenContainer((prev) => (prev === "rejection" ? null : "rejection"))}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
              disabled={isUpdatingStatus} // Disable button while updating
            >
              <FaTimes className="mr-2" /> Reject
            </button>

            {/* Download Documents Button */}
            <button
              onClick={handleDownloadAllDocuments}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center"
            >
              <FaDownload className="mr-2" />
              {isLoading ? "Downloading..." : "Download"}
            </button>
          </div>

          {/* Upload Sections */}
          <div className="flex space-x-4 mb-6">
            {/* Upload Receipt Section */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Upload Receipt
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleReceiptFileChange}
                className="border p-2 rounded text-sm w-full"
              />
              {selectedReceiptFile && (
                <button
                  onClick={handleCancelReceiptFile}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                >
                  Cancel Receipt
                </button>
              )}
              <button
                onClick={handleUploadReceipt}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mt-2 w-full"
              >
                <FaFileAlt className="mr-2" /> Upload Receipt
              </button>
              {documentData?.receipt_url && (
                <button
                  onClick={handleDownloadReceipt}
                  className="bg-[#F58A3B] text-white px-4 py-2 rounded hover:bg-green-600 flex items-center mt-2 w-full"
                >
                  <FaFileAlt className="mr-2" /> View Receipt
                </button>
              )}
            </div>

            {/* Upload Certificate Section */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Upload Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                className="border p-2 rounded text-sm w-full"
              />
              {selectedFile && (
                <button
                  onClick={handleCancelFile}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                >
                  Cancel Certificate
                </button>
              )}
              <button
                onClick={handleUploadCertificate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mt-2 w-full"
              >
                <FaFileAlt className="mr-2" /> Upload Certificate
              </button>
              {certificates &&
                certificates.some(
                  (cert) => String(cert.document_id) === String(documentId)
                ) && (
                  <button
                    onClick={() => handleViewCertificate(documentId)}
                    className="bg-[#F58A3B] text-white px-4 py-2 rounded flex items-center mt-2 w-full"
                  >
                    <FaFileAlt className="mr-2" /> View Certificate
                  </button>
                )}
            </div>
          </div>

          {/* Download OC Button */}
          <button
            onClick={DownloadAllDocuments}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mt-2 "
          >
            <FaDownload className="mr-2" />
            {isLoading ? "Downloading..." : "Download OC"}
          </button>

          {/* Preview Section */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
              <div className="relative w-3/4 h-3/4 bg-white shadow-lg rounded-lg flex flex-col">
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded"
                >
                  Close
                </button>
                <iframe
                  src={previewReceiptFile || previewFile}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          {/* Rejection Input Section */}
          {
            openContainer === "rejection" && (
              <div className="mt-4 space-y-2">
                {/* Textarea for entering rejection reason */}
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4} // Set a fixed number of rows for better UI
                />

                {/* Buttons for sending or canceling rejection */}
                <div className="flex justify-end space-x-4">
                  {/* Send Button */}
                  <button
                    onClick={() => handleUpdateStatus("Rejected")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400"
                    disabled={!rejectionReason.trim()} // Disable button if rejection reason is empty
                  >
                    Send
                  </button>

                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setOpenContainer(null); // Close the rejection container (UI only)
                      setRejectionReason(""); // Clear the rejection reason (UI only)
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
        </div>


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
  );
};
export default InvoicePage;
