import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegFileAlt, FaFileInvoice, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const Emplist = () => {
  const [distributors, setDistributors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    // Fetch documents without a distributor assigned
    axios
      .get("https://mazedakhale.in/api/documents/list")
      .then((response) => {
        const sortedDocuments = response.data.documents.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setDocuments(sortedDocuments); // Ensure documents are sorted from newest to oldest
      })
      .catch((error) => console.error("Error fetching documents:", error));

    // Fetch distributors
    axios
      .get("https://mazedakhale.in/api/users/distributors")
      .then((response) => setDistributors(response.data))
      .catch((error) => console.error("Error fetching distributors:", error));

    // Fetch certificates
    axios
      .get("https://mazedakhale.in/api/certificates")
      .then((response) => setCertificates(response.data))
      .catch((error) => console.error("Error fetching certificates:", error));

    // Fetch users
    axios
      .get("https://mazedakhale.in/api/users/register")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle search query change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle document verification
  // Handle document verification
  const handleVerifyDocument = async (documentId) => {
    try {
      // Get user_id from token in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "You need to be logged in to verify documents",
          icon: "error",
        });
        return;
      }

      // Parse the token to get user_id
      let verifiedBy = null;
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        verifiedBy = tokenData.user_id;
      } catch (error) {
        console.error("Error parsing token:", error);
        Swal.fire({
          title: "Error",
          text: "Could not identify you as a verified user",
          icon: "error",
        });
        return;
      }

      // Proceed directly if user_id is found
      if (verifiedBy) {
        // Call the API directly
        await axios.put(
          `https://mazedakhale.in/api/documents/verify/${documentId}`,
          { verifiedBy }
        );

        // Update the document in the local state
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.document_id === documentId
              ? {
                  ...doc,
                  verified_by: [...(doc.verified_by || []), verifiedBy],
                  verified_at: new Date(),
                }
              : doc
          )
        );
      }
    } catch (error) {
      console.error("Error verifying document:", error);
    }
  };

  const handleUpdateStatus = async (documentId, newStatus) => {
    try {
      await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
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

  // Filter documents based on selected status and search query
  // Filter documents based only on search query and status filter
  // Filter documents based only on search query and status filter
  // Parse the token to get user_id
  // Parse the token to get user_id
  const token = localStorage.getItem("token");
  let userId = null;
  try {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    userId = tokenData.user_id;
  } catch (error) {
    console.error("Error parsing token:", error);
  }

  // Filter documents based on status, search query, and user verification
  // Assuming userId is already extracted from the token
  const filteredDocuments = documents
    .filter((doc) =>
      statusFilter
        ? doc.status?.toLowerCase() === statusFilter.toLowerCase()
        : true
    )
    .filter((doc) => {
      if (!searchQuery) return true;

      const lowerQuery = searchQuery.toLowerCase();

      return (
        doc.document_id?.toString().toLowerCase().includes(lowerQuery) ||
        doc.name?.toLowerCase().includes(lowerQuery) ||
        doc.email?.toLowerCase().includes(lowerQuery) ||
        doc.phone?.toString().toLowerCase().includes(lowerQuery) ||
        doc.category_name?.toLowerCase().includes(lowerQuery) ||
        doc.subcategory_name?.toLowerCase().includes(lowerQuery) ||
        doc.address?.toLowerCase().includes(lowerQuery)
      );
    })
    .filter((doc) => {
      // Check if 'verified_by' array contains the userId
      return (
        Array.isArray(doc.verified_by) &&
        doc.verified_by.includes(userId.toString())
      );
    });

  console.log("Filtered Documents:", filteredDocuments);
  // Get distributor name by ID
  const getDistributorName = (distributorId) => {
    console.log("Checking distributor ID:", distributorId); // Debugging
    const distributor = users.find(
      (user) => String(user.user_id) === String(distributorId)
    );
    console.log("Found distributor:", distributor); // Debugging
    return distributor ? distributor.name : "";
  };
  console.log("Users array:", users);

  // Navigate to invoice view
  // Navigate to invoice view
  const handleViewInvoice = async (documentId, categoryId, subcategoryId) => {
    try {
      // Get user_id from token in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "You need to be logged in to view the invoice",
          icon: "error",
        });
        return;
      }

      // Parse the token to get user_id
      let userId = null;
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        userId = tokenData.user_id;
      } catch (error) {
        console.error("Error parsing token:", error);
        Swal.fire({
          title: "Error",
          text: "Could not identify user",
          icon: "error",
        });
        return;
      }

      // Find the document
      const document = documents.find((doc) => doc.document_id === documentId);

      // Check if the user has already verified this document
      const alreadyVerified =
        document &&
        document.verified_by &&
        Array.isArray(document.verified_by) &&
        document.verified_by.includes(userId);

      if (alreadyVerified) {
        // Directly navigate to the invoice without API call
        navigate(`/Invoice/${documentId}`, {
          state: { categoryId, subcategoryId },
        });
      } else {
        // First-time verification
        await axios.put(
          `https://mazedakhale.in/api/documents/verify/${documentId}`,
          { verifiedBy: userId }
        );

        // Update the document in the local state
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.document_id === documentId
              ? {
                  ...doc,
                  verified_by: [...(doc.verified_by || []), userId],
                  verified_at: new Date(),
                }
              : doc
          )
        );

        // Show alert only for the first verification
        Swal.fire({
          title: "Verified",
          text: "You are  verified user.",
          icon: "success",
          confirmButtonText: "Proceed to Invoice",
        }).then(() => {
          navigate(`/Invoice/${documentId}`, {
            state: { categoryId, subcategoryId },
          });
        });
      }
    } catch (error) {
      console.error("Error in invoice view process:", error);
      // Navigate anyway in case of an error
      navigate(`/Invoice/${documentId}`, {
        state: { categoryId, subcategoryId },
      });
    }
  };

  // Navigate to document view
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  // Get certificate by document ID
  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

  // View certificate
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
        alert("Certificate not found.");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      alert("Failed to fetch certificate.");
    }
  };
  const getUserNameById = (userId) => {
    const user = users.find(
      (user) => user.user_id.toString() === userId.toString()
    );
    return user ? user.name : "Unknown User";
  };
  return (
    <div className="w-[calc(100%-350px)] ml-[310px] mt-[80px] p-6">
      {/* Outer Container */}
      <div className=" bg-white shadow-lg rounded-lg border border-gray-300 ">
        {/* Header */}
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
          <h2 className="text-xl font-bold text-center text-gray-800">
            Pending Applications List
          </h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
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

        {/* Table */}
        <div className="table-container border border-gray-300 rounded-lg shadow-md p-6">
          <table className="table border-collapse border border-gray-300 min-w-full">
            <thead className="bg-gray-300">
              <tr>
                <th className="border p-2 text-center font-bold">Sr No.</th>
                <th className="border p-2 text-center font-bold">
                  Application Id
                </th>
                <th className="border p-2 text-center font-bold">
                  Applicant Name
                </th>
                <th className="border p-2 text-center font-bold">Date</th>
                <th className="border p-2 font-bold">Category</th>
                <th className="border p-2 font-bold">Subcategory</th>
                <th className="border p-2 font-bold">VLE Name</th>
                <th className="border p-2 font-bold">VLE Email</th>
                <th className="border p-2 font-bold">VLE Phone no</th>
                <th className="border p-2 font-bold">Assigned Distributor</th>
                <th className="border p-2 font-bold">Verification</th>
                <th className="border p-2 font-bold">verified user</th>

                <th className="border p-2 font-bold">Action</th>
                <th className="border p-2 font-bold">View</th>
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
                  <td className="border p-2">
                    {new Date(doc.uploaded_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
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
                            : doc.status === "Completed"
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
                                second: "2-digit",
                                hour12: true,
                              }
                            )}
                          </div>
                        ))}
                      {/* Verification Badge - Show if document has been verified */}
                      {doc.verified_by && doc.verified_by.length > 0 && (
                        <div className="flex flex-col">
                          <span className="px-3 py-1 mt-1 rounded-full text-white text-xs bg-teal-500">
                            Verified
                          </span>
                          {doc.verified_at && (
                            <span className="text-xs text-gray-600 mt-1">
                              {new Date(doc.verified_at).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getUserNameById(doc.verified_by?.[0])}</td>{" "}
                  {/* Assuming first verifier's ID */}
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleViewInvoice(doc.document_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-red-600 transition"
                    >
                      <FaFileInvoice className="mr-1" /> Action
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleView(doc.document_id)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-indigo-600 transition"
                    >
                      <FaRegFileAlt className="mr-1" /> View
                    </button>
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

export default Emplist;
