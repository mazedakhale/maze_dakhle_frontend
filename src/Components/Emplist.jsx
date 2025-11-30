import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegFileAlt, FaFileInvoice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
const Emplist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const navigate = useNavigate();

  // Get userId from token
  const token = localStorage.getItem("token");
  let userId = null;
  try {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    userId = tokenData.user_id;
  } catch (error) {
    console.error("Error parsing token:", error);
  }

  // Fetch data on component mount
  useEffect(() => {
    // Fetch documents without a distributor assigned
    axios
      .get(`${API_BASE_URL}/documents/list`)
      .then((response) => {
        const sortedDocuments = response.data.documents.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setDocuments(sortedDocuments); // Ensure documents are sorted from newest to oldest
      })
      .catch((error) => console.error("Error fetching documents:", error));

    // Fetch users
    axios
      .get(`${API_BASE_URL}/users/register`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));

    // Fetch employee assignments if userId is available
    if (userId) {
      axios
        .get(`${API_BASE_URL}/employee`)
        .then((response) => {
          console.log("Employee assignments:", response.data);
          setEmployeeAssignments(response.data);
        })
        .catch((error) => console.error("Error fetching employee assignments:", error));
    }
  }, [userId]);

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle search query change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter documents based on employee assignments
  // Get employee assignments for the logged-in employee
  const getEmployeeAssignments = (userId) => {
    return employeeAssignments
      .filter((assignment) => assignment.user_id === parseInt(userId))
      .map((assignment) => ({
        category_id: assignment.category?.category_id || assignment.category_id,
        subcategory_id: assignment.subcategory?.subcategory_id || assignment.subcategory_id,
      }));
  };

  // Check if document matches employee's assignments
  const isDocumentAssignedToEmployee = (doc) => {
    if (!userId) return false;
    
    const assignments = getEmployeeAssignments(userId);
    
    // If no assignments, don't show any documents
    if (assignments.length === 0) return false;
    
    // Check if document's category and subcategory match any assignment
    return assignments.some((assignment) => {
      return (
        assignment.category_id === doc.category_id &&
        assignment.subcategory_id === doc.subcategory_id
      );
    });
  };

  console.log("User ID for filtering:", userId);
  console.log("Employee assignments:", employeeAssignments);
  
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
      // Filter documents based on employee's assigned categories and subcategories
      return isDocumentAssignedToEmployee(doc);
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
  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Invoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  // Navigate to document view
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  return (
    <div className="w-[calc(100%-270px)] ml-[310px] mt-[80px] p-6">
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
                <th className="border p-2 font-bold">Status</th>
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
                                          {
  Array.isArray(doc.document_fields)
    ? (
        doc.document_fields.find(
          (f) =>
            typeof f.field_name === "string" &&
            f.field_name.toLowerCase().includes("name")
        )?.field_value || "-"
      )
    : (
        Object.keys(doc.document_fields).find(
          (key) => key.toLowerCase().includes("name")
        )
          ? doc.document_fields[
              Object.keys(doc.document_fields).find((key) =>
                key.toLowerCase().includes("name")
              )
            ]
          : "-"
      )
}
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
                    </div>
                  </td>
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
