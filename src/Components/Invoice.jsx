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

  // Add these two lines
  const [showRemarkInput, setShowRemarkInput] = useState(false);
  const [distributorRemark, setDistributorRemark] = useState('');

  const nodeRef = useRef(null);

  // Rest of your component...
  const filteredDistributors = distributors.filter((dist) =>
    dist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );






  useEffect(() => {
    axios
      .get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/distributors")
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
      await axios.put(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/update-status/${documentId}`, {
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
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/download/${documentId}`, {
        responseType: 'blob', // Handle binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentData.name || `documents_${documentId}`}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // alert('Download started!');
    } catch (error) {
      console.error('Error downloading documents:', error);
      alert('Failed to download documents.');
    }
  };


  // Add this function to proceed after remark is entered
  const handleProceedAfterRemark = () => {
    if (!distributorRemark.trim()) {
      alert("Please enter a remark before proceeding.");
      return;
    }
    setShowRemarkInput(false);
    setShowDistributorList(true);
  };
  const handleAssignDistributorClick = () => {
    setOpenContainer("distributor");
  };

  const handleCheckboxChange = (userId) => {
    setSelectedDistributor(userId === selectedDistributor ? null : userId);
  };

  const handleSaveClick = (userId) => {
    handleAssignDistributor(userId);
    // setSelectedDistributor(null);
    // alert("Distributor selected successfully!");
  };


  const handleAssignDistributor = async (distributorId) => {
    if (!distributorId) return;
    try {
      await axios.put(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/assign-distributor/${documentId}`, {
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
    window.location.href = "/";
  };



  const fetchDocumentData = useCallback(async () => {
    try {
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/singledocument/documentby/${documentId}`);
      const data = response.data.document;
      setDocumentData(data);

      const category = stateCategoryId || data.category_id;
      const subcategory = stateSubcategoryId || data.subcategory_id;

      if (category && subcategory) {
        const fieldNamesResponse = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/field-names/${category}/${subcategory}`);
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
                  {[
                    { label: "Application ID", value: documentData.application_id },
                    { label: "User ID", value: documentData.user_id },
                    { label: "Category", value: documentData.category_name },
                    { label: "Subcategory", value: documentData.subcategory_name },
                    { label: "Name", value: documentData.name },
                    { label: "Email", value: documentData.email },
                    { label: "Phone", value: documentData.phone },
                    { label: "Status", value: documentData.status },
                    // { label: "Address", value: documentData.address },
                    { label: "Distributor", value: documentData.distributor_id || 'Not Assigned' }
                  ].reduce((rows, field, index, array) => {
                    if (index % 2 === 0) {
                      rows.push(array.slice(index, index + 2));
                    }
                    return rows;
                  }, []).map((pair, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      {pair.map((field, index) => (
                        <React.Fragment key={index}>
                          <td className="p-3 font-semibold border-r border-gray-300 w-1/6" style={{ backgroundColor: '#FFB4A2' }}>
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
                  {Object.entries(documentData.document_fields || {})
                    .reduce((rows, field, index, array) => {
                      if (index % 2 === 0) {
                        rows.push(array.slice(index, index + 2)); // Group 2 fields per row
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
                            <td className="w-1/3 p-3 border-r border-gray-300">{value}</td>
                          </React.Fragment>
                        ))}
                        {pair.length < 2 && (
                          <>
                            <td className="w-1/5 p-3 bg-white border-r border-gray-300"></td>
                            <td className="w-1/3 p-3 border-r border-gray-300"></td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>

            </div>
          </div>

        </div>    {/* Action Buttons */}




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
          {/* Right Side - Documents */}
          {/* <div className="w-1/2"> */}
          <div className="w-2/2 mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="mt-0 flex space-x-4 items-center">
              {/* Approve Button */}
              <button
                onClick={() => handleUpdateStatus("Approved")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              >
                <FaCheck className="mr-2" /> Approve
              </button>

              {/* Reject Button */}
              <button
                onClick={() =>
                  setOpenContainer((prev) => (prev === "rejection" ? null : "rejection"))
                }
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
              >
                <FaTimes className="mr-2" /> Reject
              </button>

              {/* Assign Distributor */}
              <button
                onClick={handleAssignDistributorClick}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <FaUserPlus className="mr-2" /> Distributor
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadAllDocuments}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center"
              >
                <FaDownload className="mr-1" /> Download
              </button>
            </div>

            {/* Rejection Input */}
            {openContainer === "rejection" && (
              <div className="mt-4 space-y-2">
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleUpdateStatus("Rejected")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setOpenContainer(null);
                      setRejectionReason("");
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}


            {openContainer === "distributor" && (
              <div className="mt-4 p-4 border rounded-lg bg-white shadow">
                <h3 className="text-xl font-bold mb-4"> Distributor</h3>

                {/* Remark input box */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Remark:
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={distributorRemark}
                    onChange={(e) => setDistributorRemark(e.target.value)}
                    placeholder="Enter remark for this assignment"
                    rows="3"
                  ></textarea>
                </div>

                {/* Distributor selection section */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Distributor:</h4>
                  <input
                    type="text"
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Search distributors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Distributor List */}
                  <ul className="space-y-2">
                    {filteredDistributors.map((dist) => (
                      <li
                        key={dist.user_id}
                        className={`flex items-center border-b last:border-b-0 p-2 rounded ${selectedDistributor === dist.user_id ? "bg-blue-200" : ""
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDistributor === dist.user_id}
                          onChange={() => handleCheckboxChange(dist.user_id)}
                          className="mr-2"
                        />
                        <span className="flex-1">{dist.name}</span>

                        {/* Save Button */}
                        {selectedDistributor === dist.user_id && (
                          <button
                            onClick={() => handleSaveClick(dist.user_id)}
                            className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Assign
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>




              </div>
            )}
          </div>

          {/* Document Preview */}
          {/* Document Preview */}
          {/* Document Preview */}


          {showDistributorList && (
            <Draggable nodeRef={nodeRef}>
              <div
                ref={nodeRef}
                className="fixed inset-0 flex items-center justify-center z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4"> Distributor</h3>

                  {/* Distributor selection section */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Select Distributor:</h4>
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Search distributors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="max-h-40 overflow-y-auto border rounded">
                      {filteredDistributors.map((distributor) => (
                        <div
                          key={distributor.id}
                          className="flex items-center justify-between p-2 border-b hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedDistributor === distributor.id}
                              onChange={() => handleCheckboxChange(distributor.id)}
                              className="mr-2"
                            />
                            <span>{distributor.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remark input box */}
                  <div className="mb-4 p-3 border rounded bg-gray-50">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Remark:
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={distributorRemark}
                      onChange={(e) => setDistributorRemark(e.target.value)}
                      placeholder="Enter remark for this assignment"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setShowDistributorList(false);
                        setSelectedDistributor(null);
                        setDistributorRemark('');
                        setOpenContainer(null);
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>


                    {selectedDistributor === dist.user_id && (
                      <button
                        onClick={() => handleSaveClick(dist.user_id)}
                        className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Assign
                      </button>
                    )}

                  </div>
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
