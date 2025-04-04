import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';
import logo1 from '../assets/logo.png';
import { FaUserCircle, FaDownload } from 'react-icons/fa';
import Draggable from 'react-draggable';
import { useRef } from 'react';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const DocumentViewer = ({ filePath, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 h-3/4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Document Viewer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &times;
          </button>
        </div>
        <iframe
          src={filePath}
          title="Document Viewer"
          className="w-full h-full border"
        />
      </div>
    </div>
  );
};

const ProcessingModal = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 text-center">
        <h2 className="text-xl font-bold mb-4">Processing...</h2>
        <p>Please wait...</p>
      </div>
    </div>
  );
};

const InvoicePage = () => {
  const { documentId } = useParams();
  const location = useLocation();
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } = location.state || {};
  const [documentData, setDocumentData] = useState(null);
  const [documentNames, setDocumentNames] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [checkedDocs, setCheckedDocs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorRemark, setDistributorRemark] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDistributorList, setShowDistributorList] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nodeRef = useRef(null);

  useEffect(() => {
    axios
      .get('https://mazedakhale.in/api/users/distributors')
      .then((response) => setDistributors(response.data))
      .catch((error) => console.error('Error fetching distributors:', error));
  }, []);

  const fetchDocumentData = useCallback(async () => {
    try {
      const response = await axios.get(`https://mazedakhale.in/api/singledocument/documentby/${documentId}`);
      const data = response.data.document;
      setDocumentData(data);

      const category = stateCategoryId || data.category_id;
      const subcategory = stateSubcategoryId || data.subcategory_id;

      if (category && subcategory) {
        const fieldNamesResponse = await axios.get(`https://mazedakhale.in/api/field-names/${category}/${subcategory}`);
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

  const handleDocumentClick = (filePath, index) => {
    setSelectedDocument(filePath);
    setShowDocumentViewer(true);
    setCheckedDocs((prev) => ({ ...prev, [index]: true }));
  };
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }

    // Collect the names of the selected documents
    const selectedDocumentNames = documentData.documents
      .filter((_, index) => checkedDocs[index]) // Filter selected documents
      .map((doc) => documentNames[doc.document_type] || doc.document_type); // Map to document names

    try {
      setIsProcessing(true); // Show loading state

      const payload = {
        status: newStatus,
        rejectionReason: rejectionReason, // Include rejection reason
        selectedDocumentNames: selectedDocumentNames, // Include selected document names
      };

      console.log('Payload:', payload); // Debug: Log the payload

      const response = await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
        payload,
        {
          timeout: 30000, // Increase timeout to 30 seconds
        }
      );

      console.log('Status updated successfully:', response.data);

      // Update local state instead of redirecting
      setDocumentData((prev) => ({
        ...prev,
        status: newStatus,
        rejectionReason: newStatus === 'Rejected' ? rejectionReason : '',
      }));

      alert('Status updated successfully.');

    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please check the console for details.');
    } finally {
      setIsProcessing(false); // Hide loading state
    }
  };


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
      const response = await axios.get(`https://mazedakhale.in/api/download/${documentId}`, {
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
  const navigate = useNavigate(); // ← Add this inside your component

  const handleAssignDistributor = async (distributorId) => {
    if (!distributorId) {
      alert('Please select a distributor.');
      return;
    }

    const allDocumentsSelected = documentData.documents.every((_, index) => checkedDocs[index]);
    if (!allDocumentsSelected) {
      alert('Please view and select all attached documents before assigning a distributor.');
      return;
    }

    try {
      setIsProcessing(true);

      const assignResponse = await axios.put(
        `https://mazedakhale.in/api/documents/assign-distributor/${documentId}`,
        {
          distributor_id: distributorId,
          remark: distributorRemark,
        }
      );
      console.log('Assign Distributor Response:', assignResponse.data);

      const statusResponse = await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
        {
          status: 'Approved',
        }
      );
      console.log('Update Status Response:', statusResponse.data);

      setDocumentData((prev) => ({
        ...prev,
        distributor_id: distributorId,
        status: 'Approved',
        remark: distributorRemark,
      }));

      setSelectedDistributor(null);
      setDistributorRemark('');

      alert('Distributor assigned successfully and status updated to Approved.');

      // ✅ Redirect to VerifyDocuments page
      navigate('/Verifydocuments'); // Change path if different

    } catch (error) {
      console.error('Error assigning distributor or updating status:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to assign distributor or update status. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleCheckboxChange = (userId) => {
    setSelectedDistributor(userId === selectedDistributor ? null : userId);
  };

  const handleRemarkChange = (e) => {
    // Check if all documents are selected
    const allDocumentsSelected = documentData.documents.every((_, index) => checkedDocs[index]);

    if (!allDocumentsSelected) {
      alert('Please view and select all attached documents before entering a remark.');
      return; // Stop if not all documents are selected
    }

    // If all documents are selected, allow the remark to be updated
    setDistributorRemark(e.target.value);
  };

  const handleSaveClick = (userId) => {
    handleAssignDistributor(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const filteredDistributors = distributors.filter((dist) =>
    dist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!documentData) return <div className="text-center text-lg mt-10">Loading Invoice...</div>;

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">


      <div className="flex space-x-6">
        {/* Left-Side Container (Smaller) */}
        <div className="w-3/5 border-r pr-6 h-[700px] overflow-y-auto text-sm">
          <div className="flex justify-center items-center p-0">
            <div className="w-full border rounded-lg shadow-lg p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <img src={logo1} alt="Logo" className="w-24 h-24 object-contain" />
                <div className="text-center flex-1">
                  <h2 className="text-3xl font-bold text-gray-700">Application Details</h2>
                </div>
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
              <hr className="border-gray-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Application for {documentData.category_name}
              </h3>
              <table className="w-full border border-gray-300 mb-6">
                <tbody>
                  {[
                    { label: 'Application ID', value: documentData.application_id },
                    { label: 'User ID', value: documentData.user_id },
                    { label: 'Category', value: documentData.category_name },
                    { label: 'Subcategory', value: documentData.subcategory_name },
                    { label: 'Name', value: documentData.name },
                    { label: 'Email', value: documentData.email },
                    { label: 'Phone', value: documentData.phone },
                    { label: 'Status', value: documentData.status },
                    { label: 'Distributor', value: documentData.distributor_id || 'Not Assigned' },
                    { label: 'Remark', value: documentData.remark || 'No remark' },
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
                          <td className="p-3 border-r border-gray-300" style={{ backgroundColor: '##F58A3B14' }}></td>
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
                      return null; // No fields to display
                    }

                    return fieldsArray
                      .reduce((rows, field, index, array) => {
                        if (index % 2 === 0) {
                          rows.push(array.slice(index, index + 2));
                        }
                        return rows;
                      }, [])
                      .map((pair, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          {pair.map(([key, value], index) => (
                            <React.Fragment key={index}>
                              <td className="w-1/5 p-3 font-semibold border-r border-gray-300 bg-white">
                                {key}
                              </td>
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
        </div>

        {/* Right-Side Container (Larger) */}
        <div className="w-2/5 mx-auto p-4 bg-white shadow-md rounded-lg text-sm">
          <h2 className="text-xl font-bold text-gray-700 mb-2 flex items-center">📋 Application Details</h2>
          <p className="text-gray-600">
            <strong>Name:</strong> <span className="font-semibold">{documentData.name}</span>
          </p>
          <p className="text-gray-600 mb-3">
            <strong>Application ID:</strong> {documentData.application_id}
          </p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Attached Documents</h3>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-1 text-left border border-gray-300 w-1/12"></th>
                <th className="p-1 text-left border border-gray-300">Name</th>
              </tr>
            </thead>
            <tbody>
              {documentData.documents?.map((doc, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-1 border border-gray-300 text-center">
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
                  <td
                    className="p-1 border border-gray-300 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleDocumentClick(doc.file_path, index)}
                  >
                    {documentNames[doc.document_type] || doc.document_type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex space-x-3 items-center">
            {/* Download Documents Button */}
            <button
              onClick={handleDownloadAllDocuments}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center  text-sm"
            >
              <FaDownload className="mr-2" /> {/* Icon with margin */}
              {isLoading ? "Downloading..." : "Download "}
            </button>


            <button
              onClick={() => setShowDistributorList(!showDistributorList)}
              className="bg-blue-500 text-white px-8 py-1 rounded hover:bg-blue-600 flex items-center text-sm"
            >
              Distributor
            </button>
            <button
              onClick={() => setShowRejectBox(!showRejectBox)}
              // className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center text-sm"
              className="bg-red-500 text-white px-6 py-1 rounded hover:bg-blue-600 flex items-center text-sm"

            >
              Reject
            </button>
          </div>

          {showDistributorList && (
            <div className="mt-3 p-3 border rounded-lg bg-white shadow">
              <h3 className="text-lg font-bold mb-2">Assign Distributor</h3>
              <div className="mb-2">
                <h4 className="font-semibold mb-1">Select Distributor:</h4>
                <input
                  type="text"
                  className="w-full p-1 border rounded mb-1"
                  placeholder="Search distributors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ul className="space-y-1">
                  {filteredDistributors.map((dist) => (
                    <li
                      key={dist.user_id}
                      className={`flex items-center border-b last:border-b-0 p-1 rounded ${selectedDistributor === dist.user_id ? 'bg-blue-200' : ''
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistributor === dist.user_id}
                        onChange={() => handleCheckboxChange(dist.user_id)}
                        className="mr-1"
                      />
                      <span className="flex-1">{dist.name}</span>
                      {selectedDistributor === dist.user_id && (
                        <button
                          onClick={() => handleSaveClick(dist.user_id)}
                          className="bg-blue-900 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Assign to Distributor
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {showRejectBox && (
            <div className="mt-3 space-y-1">
              <label className="block text-gray-700 text-sm font-bold mb-1">Reject with Reason:</label>
              <textarea
                className="w-full p-1 border rounded"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleUpdateStatus('Rejected')}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Send To VlE
                </button>
                <button
                  onClick={() => setRejectionReason('')}
                  className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Remark Section */}
          <div className="mt-3">
            <label className="block text-gray-700 text-sm font-bold mb-1">Remark:</label>
            <textarea
              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={distributorRemark}
              onChange={handleRemarkChange}
              placeholder="Enter remark for this assignment (optional)"
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>

      {showDocumentViewer && (
        <DocumentViewer
          filePath={selectedDocument}
          onClose={() => setShowDocumentViewer(false)}
        />
      )}

      {isProcessing && <ProcessingModal />}
    </div>
  );
};

export default InvoicePage;