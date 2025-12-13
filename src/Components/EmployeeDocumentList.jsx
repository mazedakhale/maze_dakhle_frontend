import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaRegFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import API_BASE_URL from "../config/api";

const EmployeeDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState({
    categoryId: "",
    categoryName: "",
    subcategoryId: "",
    subcategoryName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Helper function to detect name fields in multiple languages
  const getApplicantName = (documentFields) => {
    if (!documentFields) return "-";
    const namePatterns = ["name", "applicant name", "full name", "customer name", "person name", "नाम", "आवेदक का नाम", "पूरा नाम", "व्यक्ति का नाम", "ग्राहक का नाम", "नाव", "अर्जदाराचे नाव", "पूर्ण नाव", "व्यक्तीचे नाव", "ग्राहकाचे नाव", "applicant", "अर्जदार", "आवेदक"];
    const isNameField = (fieldName) => {
      if (!fieldName || typeof fieldName !== "string") return false;
      const lowerFieldName = fieldName.toLowerCase().trim();
      const matchesPattern = namePatterns.some(pattern => lowerFieldName.includes(pattern.toLowerCase()) || fieldName.includes(pattern));
      if (matchesPattern) return true;
      const nameIndicators = [/\bname\b/i, /\bfull\b/i, /\bfirst\b/i, /\blast\b/i, /\bapplicant\b/i, /name$/i, /नाम$/i, /नाव$/i, /^name/i, /^नाम/i, /^नाव/i, /^full/i, /^applicant/i];
      return nameIndicators.some(pattern => pattern.test(fieldName));
    };
    const findBestNameField = (fields) => {
      const priorities = [/full.*name|name.*full/i, /applicant.*name|name.*applicant/i, /^name$/i, /name/i, /नाम|नाव/];
      for (const priority of priorities) {
        const match = fields.find(field => priority.test(field.key));
        if (match) return match;
      }
      return fields[0];
    };
    if (Array.isArray(documentFields)) {
      const nameFields = documentFields.filter(field => isNameField(field.field_name)).map(field => ({ key: field.field_name, value: field.field_value }));
      if (nameFields.length === 0) return "-";
      return findBestNameField(nameFields)?.value || "-";
    }
    if (typeof documentFields === "object") {
      const nameFields = Object.keys(documentFields).filter(key => isNameField(key)).map(key => ({ key, value: documentFields[key] }));
      if (nameFields.length === 0) return "-";
      return findBestNameField(nameFields)?.value || "-";
    }
    return "-";
  };

  useEffect(() => {
    // Get token and user info first
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "User token not found. Please login again.", "error")
        .then(() => navigate("/login"));
      return;
    }

    // Decode token to get user info
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const userData = JSON.parse(jsonPayload);

      if (!userData || !userData.user_id) {
        Swal.fire("Error", "User information not found in token", "error");
        return;
      }

      // For Admin, allow access to all categories
      if (userData.role === "Admin") {
        handleCategoryAccess(userData);
      } 
      // For Employee, check their assignments first
      else if (userData.role === "Employee") {
        fetchEmployeeAssignments(userData);
      } else {
        handleUnauthorized();
      }

    } catch (error) {
      console.error("Error decoding token:", error);
      Swal.fire("Error", "Invalid token format", "error");
    }
  }, [params, location, navigate]);

  // Fetch employee's assigned categories and subcategories
  const fetchEmployeeAssignments = async (userData) => {
    try {
      setLoading(true);
      console.log("Fetching assignments for user ID:", userData.user_id);
      
      // Fetch employee assignments using the correct API endpoint
      const response = await axios.get(
        `${API_BASE_URL}/employee/employeeAsUser/${userData.user_id}`,
      );
      console.log("Employee assignments response:", response.data);

      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error("Expected array but got:", typeof response.data, response.data);
        throw new Error("Invalid response format: expected array of assignments");
      }

      // Transform the response to match expected structure
      const assignments = response.data.map(assignment => ({
        id: assignment.id,
        category_id: assignment.category?.category_id,
        category_name: assignment.category?.category_name,
        subcategory_id: assignment.subcategory?.subcategory_id,
        subcategory_name: assignment.subcategory?.subcategory_name,
        user_id: assignment.user_id
      }));

      console.log("Transformed assignments:", assignments);
      setEmployeeAssignments(assignments);

      // Check if employee has any assignments
      if (assignments.length === 0) {
        console.warn("Employee has no assignments");
        Swal.fire({
          title: "No Assignments",
          text: "You are not assigned to any categories yet. Please contact your administrator.",
          icon: "warning",
          confirmButtonText: "OK"
        }).then(() => {
          navigate("/dashboard");
        });
        setLoading(false);
        return;
      }

      // Now check if current category/subcategory is in assignments
      handleCategoryAccess(userData, assignments);
      
    } catch (error) {
      console.error("Error fetching employee assignments:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Show more detailed error message
      let errorMessage = "Unable to fetch employee assignments.";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Employee assignments not found. You may not be assigned to any categories yet.";
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      }
      
      Swal.fire(
        "Error", 
        errorMessage, 
        "error"
      );
      setLoading(false);
    }
  };

  // Handle category access validation and data fetching
  const handleCategoryAccess = (userData, assignments = []) => {
    console.log("handleCategoryAccess called with:", { userData: userData.user_id, assignmentsCount: assignments.length });
    
    // Try to get category and subcategory info from multiple sources
    let categoryId, categoryName, subcategoryId, subcategoryName;

    // 1. Try to get from URL parameters
    if (params.categoryId && params.subcategoryId) {
      categoryId = params.categoryId;
      subcategoryId = params.subcategoryId;
      console.log("Got from URL params:", { categoryId, subcategoryId });
    }
    
    // 2. Try to get from location state (passed via navigate)
    if (location.state) {
      categoryId = location.state.categoryId || categoryId;
      subcategoryId = location.state.subcategoryId || subcategoryId;
      categoryName = location.state.categoryName || categoryName;
      subcategoryName = location.state.subcategoryName || subcategoryName;
      console.log("Got from location state:", { categoryId, subcategoryId, categoryName, subcategoryName });
    }
    
    // 3. Fallback to localStorage
    if (!categoryId || !subcategoryId) {
      categoryId = categoryId || localStorage.getItem("selectedCategoryId");
      categoryName = categoryName || localStorage.getItem("selectedCategoryName");
      subcategoryId = subcategoryId || localStorage.getItem("selectedSubcategoryId");
      subcategoryName = subcategoryName || localStorage.getItem("selectedSubcategoryName");
      console.log("Got from localStorage:", { categoryId, subcategoryId, categoryName, subcategoryName });
    }

    console.log("Final values:", { categoryId, subcategoryId, categoryName, subcategoryName });

    // Check if employee is authorized for this category/subcategory
    if (userData.role === "Employee" && assignments.length > 0) {
      // If no specific category/subcategory is provided, show all assigned documents
      if (!categoryId || !subcategoryId) {
        console.log("No specific category/subcategory provided, showing all assigned documents");
        setIsAuthorized(true);
        setCategoryInfo({
          categoryId: "all",
          categoryName: "All Assigned Categories",
          subcategoryId: "all",
          subcategoryName: "All Assigned Subcategories",
        });
        // Fetch all documents for this employee across all their assignments
        fetchAllAssignedDocuments(userData.user_id, userData.role, assignments);
        return;
      }

      // First check if we have valid categoryId and subcategoryId
      if (!categoryId || !subcategoryId) {
        console.warn("Missing categoryId or subcategoryId:", { categoryId, subcategoryId });
        setIsAuthorized(false);
        setLoading(false);
        Swal.fire({
          title: "Missing Information",
          text: "Category or subcategory information is missing. Please select a category and subcategory first.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Go to Categories",
          cancelButtonText: "Go Back"
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/categories");
          } else {
            navigate(-1);
          }
        });
        return;
      }

      const isAssigned = assignments.some(assignment => 
        assignment.category_id?.toString() === categoryId.toString() && 
        assignment.subcategory_id?.toString() === subcategoryId.toString()
      );

      if (!isAssigned) {
        setIsAuthorized(false);
        setLoading(false);
        Swal.fire({
          title: "Access Denied",
          text: "You are not assigned to this category and subcategory.",
          icon: "error",
          confirmButtonText: "Go to Assigned Categories"
        }).then(() => {
          // Navigate to a page showing their assigned categories
          navigate("/employee-assignments");
        });
        return;
      }
    }

    setIsAuthorized(true);

    if (!categoryId || !subcategoryId) {
      setLoading(false);
      Swal.fire({
        title: "Missing Information",
        text: "Category or subcategory information is missing. Please select a category and subcategory first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Categories",
        cancelButtonText: "Go Back"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/categories");
        } else {
          navigate(-1);
        }
      });
      return;
    }

    // Set category info and fetch documents
    if (categoryId && subcategoryId && (!categoryName || !subcategoryName)) {
      fetchCategoryInfo(categoryId, subcategoryId).then((info) => {
        setCategoryInfo({
          categoryId,
          categoryName: info.categoryName || categoryName || "Unknown Category",
          subcategoryId,
          subcategoryName: info.subcategoryName || subcategoryName || "Unknown Subcategory",
        });
      });
    } else {
      setCategoryInfo({
        categoryId: categoryId || "",
        categoryName: categoryName || "Unknown Category",
        subcategoryId: subcategoryId || "",
        subcategoryName: subcategoryName || "Unknown Subcategory",
      });
    }

    // Fetch documents
    fetchDocuments(categoryId, subcategoryId, userData.user_id, userData.role);
  };

  // Helper function to fetch category and subcategory names
  const fetchCategoryInfo = async (categoryId, subcategoryId) => {
    try {
      const [categoryResponse, subcategoryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/categories/${categoryId}`),
        axios.get(`${API_BASE_URL}/subcategories/${subcategoryId}`)
      ]);
      
      return {
        categoryName: categoryResponse.data?.category_name || "Unknown Category",
        subcategoryName: subcategoryResponse.data?.subcategory_name || "Unknown Subcategory"
      };
    } catch (error) {
      console.error("Error fetching category info:", error);
      return {
        categoryName: "Unknown Category",
        subcategoryName: "Unknown Subcategory"
      };
    }
  };

  const fetchDocuments = async (
    categoryId,
    subcategoryId,
    userId,
    userRole
  ) => {
    try {
      setLoading(true);
      
      // Check if user role is Admin or Employee
      if (userRole === "Admin" || userRole === "Employee") {
        // Use the API endpoint
        const response = await axios.get(
          `${API_BASE_URL}/documents/category-docs/${categoryId}/${subcategoryId}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (response.data.error) {
          Swal.fire("Error", response.data.error, "error");
          setDocuments([]);
        } else {
          // For employees, additional filter to ensure they only see documents 
          // from categories/subcategories they're assigned to
          if (userRole === "Employee" && employeeAssignments.length > 0) {
            const authorizedDocs = response.data.filter(doc => {
              return employeeAssignments.some(assignment => 
                assignment.category_id.toString() === categoryId.toString() && 
                assignment.subcategory_id.toString() === subcategoryId.toString()
              );
            });
            setDocuments(authorizedDocs);
          } else {
            setDocuments(response.data);
          }
        }
      } else {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch documents", "error");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all documents for employee's assigned categories/subcategories
  const fetchAllAssignedDocuments = async (userId, userRole, assignments) => {
    try {
      setLoading(true);
      
      if (userRole === "Employee" && assignments.length > 0) {
        // Fetch documents for all assignments
        const allDocuments = [];
        
        for (const assignment of assignments) {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/documents/category-docs/${assignment.category_id}/${assignment.subcategory_id}/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                }
              }
            );

            if (response.data && !response.data.error) {
              // Add category and subcategory info to each document
              const docsWithCategoryInfo = response.data.map(doc => ({
                ...doc,
                category_name: assignment.category_name,
                subcategory_name: assignment.subcategory_name,
                assignment_category_id: assignment.category_id,
                assignment_subcategory_id: assignment.subcategory_id
              }));
              allDocuments.push(...docsWithCategoryInfo);
            }
          } catch (assignmentError) {
            console.error(`Error fetching documents for assignment ${assignment.id}:`, assignmentError);
            // Continue with other assignments even if one fails
          }
        }

        // Remove duplicates based on document_id
        const uniqueDocuments = allDocuments.filter((doc, index, self) => 
          index === self.findIndex(d => d.document_id === doc.document_id)
        );

        console.log("All assigned documents:", uniqueDocuments);
        setDocuments(uniqueDocuments);
      } else if (userRole === "Admin") {
        // For admin, fetch all documents (this is a fallback case)
        const response = await axios.get(`${API_BASE_URL}/documents/list`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setDocuments(response.data.documents || response.data);
      } else {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error fetching all assigned documents:", error);
      Swal.fire("Error", "Failed to fetch assigned documents", "error");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for unauthorized users
  const handleUnauthorized = () => {
    setDocuments([]);
    Swal.fire(
      "Access Denied",
      "You don't have permission to view these documents",
      "error"
    );
    navigate("/dashboard"); // Redirect unauthorized users
  };

  // Handle search and filter changes
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter documents based on search query and status filter
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
        doc.document_name?.toLowerCase().includes(lowerQuery) ||
        doc.user?.name?.toLowerCase().includes(lowerQuery) ||
        doc.user?.email?.toLowerCase().includes(lowerQuery) ||
        doc.user?.phone?.toString().toLowerCase().includes(lowerQuery) ||
        categoryInfo.categoryName.toLowerCase().includes(lowerQuery) ||
        categoryInfo.subcategoryName.toLowerCase().includes(lowerQuery)
      );
    });

  // Get user role from token for access control
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const userData = JSON.parse(jsonPayload);
      return userData.role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  // Only show the component to Admin or Employee users
  if (userRole !== "Admin" && userRole !== "Employee") {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-500">Access Denied</h2>
          <p className="mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message for employees trying to access unassigned categories
  if (!isAuthorized) {
    return (
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-500">Access Denied</h2>
          <p className="mt-2">You are not assigned to this category and subcategory.</p>
          <button
            onClick={() => navigate("/employee-assignments")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Your Assignments
          </button>
        </div>
      </div>
    );
  }

  // Handle view document
  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  // Handle view invoice
  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Invoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  // Handle download receipt
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const fileExtension = receiptUrl.split(".").pop().toLowerCase();
      const fileName = `${documentName}_receipt.${fileExtension}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire(
        "Error",
        "Failed to download receipt. Please try again.",
        "error"
      );
    }
  };

  // Handle view certificate
  const handleViewCertificate = async (documentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/certificates/by-document/${documentId}`
      );
      if (response.data && response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        Swal.fire("Error", "Certificate not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };
  


  return (
    <div className="w-[calc(100%-350px)] ml-[310px] mt-[80px] p-6">
      {/* Outer Container */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-300">
        {/* Header */}
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-center text-gray-800">
            {categoryInfo.categoryName} &gt; {categoryInfo.subcategoryName}{" "}
            Documents
          </h2>
          {getUserRole() === "Employee" && (
            <div className="mt-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                ✓ Assigned Category - You have access to view these documents
              </span>
            </div>
          )}
        </div>

        {/* Search Bar and Status Filter */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <span className="text-gray-700">Filter by Status:</span>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="Approved"
                checked={statusFilter === "Approved"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Approved
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="Completed"
                checked={statusFilter === "Completed"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Completed
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="Uploaded"
                checked={statusFilter === "Uploaded"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Uploaded
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="Pending"
                checked={statusFilter === "Pending"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Pending
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="Rejected"
                checked={statusFilter === "Rejected"}
                onChange={handleStatusFilterChange}
                className="mr-2"
              />
              Rejected
            </label>
          </div>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="table-container border border-gray-300 rounded-lg shadow-md mt-4">
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
              <th className="border p-2 text-center font-bold">Datetime</th>
              <th className="border p-2 font-bold">Category</th>
              <th className="border p-2 font-bold">Subcategory</th>
              <th className="border p-2 font-bold">VLE Name</th>
              <th className="border p-2 font-bold">VLE Email</th>
              <th className="border p-2 font-bold">VLE Phone</th>
              <th className="border p-2 font-bold">Verification</th>
              <th className="border p-2 font-bold">View</th>
              <th className="border p-2 font-bold">Action</th>
              <th className="border p-2 font-bold">Receipt</th>
              <th className="border p-2 font-bold">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
                <tr
                  key={doc.id || doc.document_id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-center">
                    {doc.application_id || doc.document_id}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {getApplicantName(doc.document_fields)}
                  </td>
                  <td className="border p-2">
                    {new Date(
                      doc.upload_date || doc.uploaded_at
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="border p-2">
                    {doc.category_name || categoryInfo.categoryName}
                  </td>
                  <td className="border p-2">
                    {doc.subcategory_name || categoryInfo.subcategoryName}
                  </td>
                  <td className="border p-2">{doc?.name || "N/A"}</td>
                  <td className="border p-2">{doc?.email || "N/A"}</td>
                  <td className="border p-2">{doc?.phone || "N/A"}</td>
                  <td className="border p-2">
                    <div className="flex flex-col gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          doc.status === "Completed"
                            ? "bg-yellow-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : doc.status === "Approved"
                            ? "bg-blue-500"
                            : "bg-gray-500" // Default for other statuses
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
                  <td className="border p-2">
                    {console.log( "Document path:", doc.document_path)}
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => handleView(doc.document_id)}
                    >
                      <FaRegFileAlt className="inline mr-1" /> View
                    </button>
                  </td>
                  <td className="border p-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() =>
                        handleViewInvoice(
                          doc.document_id || doc.id,
                          categoryInfo.categoryId,
                          categoryInfo.subcategoryId
                        )
                      }
                    >
                      <FaFileInvoice className="inline mr-1" /> Action
                    </button>
                  </td>
                  <td className="border p-2">
                    {doc.receipt_url ? (
                      <button
                        className="bg-purple-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          handleDownloadReceipt(
                            doc.receipt_url,
                            doc.document_name || "document"
                          )
                        }
                      >
                        <FaDownload className="inline mr-1" /> Receipt
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {doc.certificate_id || doc.has_certificate ? (
                      <button
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          handleViewCertificate(doc.document_id || doc.id)
                        }
                      >
                        <FaDownload className="inline mr-1" /> Certificate
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No certificate
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center py-10 bg-gray-50">
                  <FaRegFileAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No documents found for this category and subcategory.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDocumentList;
