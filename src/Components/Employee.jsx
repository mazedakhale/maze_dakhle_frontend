import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
// Set default timeout for all axios requests
axios.defaults.timeout = 30000; // 30 seconds
const Employee = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_ids: [], // Array for multiple subcategories
    user_id: "",
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all required data on component mount
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employee`);
      console.log("Fetched employee documents:", response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire(
        "Error",
        "Failed to fetch documents. Server might be down.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Failed to fetch categories.", "error");
    }
  };

  const fetchEmployees = async () => {
    try {
      // Using the same endpoint as in EmployeeList component
      const response = await axios.get(`${API_BASE_URL}/users/employee`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire(
        "Error",
        "Failed to fetch employees. Server might be down.",
        "error"
      );
    }
  };

  // Helper function to get employee name from ID
  const getEmployeeName = (userId) => {
    const employee = employees.find(
      (emp) => emp.user_id === parseInt(userId) || emp.user_id === userId
    );
    return employee ? employee.name : userId;
  };

  const handleCategoryChange = async (e) => {
    const selectedCategoryId = e.target.value;
    setFormData({
      ...formData,
      category_id: selectedCategoryId,
      subcategory_ids: [],
    });

    if (selectedCategoryId) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/subcategories/category/${selectedCategoryId}`
        );
        setSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setSubcategories([]);
        Swal.fire("Error", "Failed to fetch subcategories.", "error");
      }
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setFormData((prevData) => {
      // Check if the subcategory is already selected
      if (prevData.subcategory_ids.includes(subcategoryId)) {
        // If selected, remove it
        return {
          ...prevData,
          subcategory_ids: prevData.subcategory_ids.filter(
            (id) => id !== subcategoryId
          ),
        };
      } else {
        // If not selected, add it
        return {
          ...prevData,
          subcategory_ids: [...prevData.subcategory_ids, subcategoryId],
        };
      }
    });
  };

  const handleDelete = async (id) => {
    const codeResult = await Swal.fire({
      title: "Enter Deletion Code",
      text: "Please enter the deletion code to confirm",
      input: "text",
      inputPlaceholder: "Enter deletion code",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Verify & Delete",
      inputValidator: (value) => {
        if (!value) return "Please enter the deletion code";
      },
    });

    if (!codeResult.isConfirmed) return;

    try {
      Swal.fire({
        title: "Verifying...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.delete(`${API_BASE_URL}/employee/${id}`, {
        data: { code: codeResult.value }
      });

      setDocuments((prevDocuments) =>
        prevDocuments.filter((document) => document.id !== id)
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Document deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete employee";
      
      if (errorMessage.includes("Invalid deletion code")) {
        Swal.fire({
          icon: "error",
          title: "Invalid Deletion Code",
          html: `
            <p>${errorMessage}</p>
            <p style="margin-top: 15px;">
              <a href="/AdminDeletionCodeSettings" style="color: #f58a3b; text-decoration: underline;">
                Forgot Code?  Change Code Here
              </a>
            </p>
          `,
          confirmButtonColor: "#f58a3b",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    }
  };

  const handleEdit = async (groupedDoc) => {
    setEditId(groupedDoc.id);
    setFormData({
      category_id: groupedDoc.category_id,
      subcategory_ids: groupedDoc.subcategory_ids.map((id) => id?.toString()),
      user_id: groupedDoc.user_id,
    });

    try {
      const response = await axios.get(
        `${API_BASE_URL}/subcategories/category/${groupedDoc.category_id}`
      );
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    }

    setModalOpen(true);
  };

  // Check if a subcategory is already assigned to the selected employee
  const isSubcategoryAlreadyAssigned = (subcategoryId) => {
    if (!formData.user_id || !formData.category_id) return false;
    
    return documents.some((doc) => {
      const docCategoryId = doc.category?.category_id || doc.category_id;
      const docSubcategoryId = doc.subcategory?.subcategory_id || doc.subcategory_id;
      const docUserId = doc.user_id;
      
      // If editing, exclude the current document from the check
      if (editId && doc.id === editId) return false;
      
      // Check if this employee already has this category+subcategory combination
      return (
        docUserId === parseInt(formData.user_id) &&
        docCategoryId === parseInt(formData.category_id) &&
        docSubcategoryId === parseInt(subcategoryId)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subcategory_ids.length === 0) {
      Swal.fire("Error", "Please select at least one subcategory", "error");
      return;
    }

    // Check for duplicate assignments
    const alreadyAssignedSubcategories = formData.subcategory_ids.filter((subId) =>
      isSubcategoryAlreadyAssigned(subId)
    );

    if (alreadyAssignedSubcategories.length > 0 && !editId) {
      const subcategoryNames = alreadyAssignedSubcategories
        .map((subId) => {
          const sub = subcategories.find(
            (s) => s.subcategory_id === parseInt(subId)
          );
          return sub?.subcategory_name || subId;
        })
        .join(", ");

      Swal.fire({
        title: "Already Assigned!",
        text: `The following subcategories are already assigned to this employee: ${subcategoryNames}`,
        icon: "warning",
        confirmButtonColor: "#f58a3b",
      });
      return;
    }

    // Show "Processing, please wait" alert
    Swal.fire({
      title: "Processing",
      text: "Please wait while your request is being processed...",
      icon: "info",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Convert string IDs to numbers for the API
      const dataToSend = {
        category_id: parseInt(formData.category_id),
        subcategory_ids: formData.subcategory_ids.map((id) => parseInt(id)),
        user_id: parseInt(formData.user_id),
      };

      if (editId) {
        // For edit, use the PUT endpoint with the new API format
        await axios.put(`${API_BASE_URL}/employee/${editId}`, dataToSend);
      } else {
        // For create, use the POST endpoint with the new API format
        await axios.post(`${API_BASE_URL}/employee`, dataToSend);
      }

      Swal.fire({
        title: "Success!",
        text: `Document ${editId ? "updated" : "added"} successfully`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setModalOpen(false);
      setFormData({
        category_id: "",
        subcategory_ids: [],
        user_id: "",
      });
      setEditId(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting document:", error);
      Swal.fire(
        "Error!",
        `Failed to ${editId ? "update" : "add"} document`,
        "error"
      );
    }
  };

  // Modal component
  const Modal = () => {
    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 text-center border-b pb-2">
            {editId ? "Edit Document" : "Add New Document"}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={handleCategoryChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Subcategories <span className="text-red-500">*</span>
              </label>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {subcategories.length > 0 ? (
                  subcategories.map((subcategory) => {
                    const isAlreadyAssigned = isSubcategoryAlreadyAssigned(
                      subcategory.subcategory_id?.toString()
                    );
                    const isChecked = formData.subcategory_ids.includes(
                      subcategory.subcategory_id?.toString()
                    );

                    return (
                      <div key={subcategory.subcategory_id} className="mb-2">
                        <label
                          className={`inline-flex items-center ${
                            isAlreadyAssigned && !editId
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={subcategory.subcategory_id}
                            checked={isChecked}
                            disabled={isAlreadyAssigned && !editId}
                            onChange={() =>
                              handleSubcategoryChange(
                                subcategory.subcategory_id?.toString()
                              )
                            }
                            className="form-checkbox h-5 w-5 text-orange-500 disabled:cursor-not-allowed"
                          />
                          <span className="ml-2">
                            {subcategory.subcategory_name}
                            {isAlreadyAssigned && !editId && (
                              <span className="ml-2 text-xs text-red-500 font-semibold">
                                (Already Assigned)
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">
                    {formData.category_id
                      ? "No subcategories found for this category"
                      : "Please select a category first"}
                  </p>
                )}
              </div>
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.user_id} value={employee.user_id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Assigned Employee List{" "}
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

        {/* Add Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={() => {
              setModalOpen(true);
              setEditId(null);
              setFormData({
                category_id: "",
                subcategory_ids: [],
                user_id: "",
              });
              setSubcategories([]);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Document
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
              <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                <tr>
                  {["Category", "Subcategories", "Employee", "Actions"].map(
                    (header, index) => (
                      <th
                        key={`header-${index}`}
                        className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  // Group documents by category_id and user_id
                  Object.values(
                    documents
                      .filter((doc) => {
                        // Filter out documents with null category and subcategory
                        const categoryId = doc.category?.category_id || doc.category_id;
                        const subcategoryId = doc.subcategory?.subcategory_id || doc.subcategory_id;
                        return categoryId && subcategoryId;
                      })
                      .reduce((acc, doc) => {
                      // Create a unique key for each category+employee combination
                      // Handle both nested objects and direct IDs
                      const categoryId = doc.category?.category_id || doc.category_id;
                      const subcategoryId = doc.subcategory?.subcategory_id || doc.subcategory_id;
                      const key = `${categoryId}-${doc.user_id}`;

                      if (!acc[key]) {
                        acc[key] = {
                          id: doc.id, // Keep first document's ID for edit/delete
                          category_id: categoryId,
                          category_name: doc.category?.category_name,
                          user_id: doc.user_id,
                          subcategory_ids: [subcategoryId],
                          subcategories: [{
                            id: subcategoryId,
                            name: doc.subcategory?.subcategory_name
                          }],
                        };
                      } else {
                        // Add subcategory to existing group if not already included
                        if (!acc[key].subcategory_ids.includes(subcategoryId)) {
                          acc[key].subcategory_ids.push(subcategoryId);
                          acc[key].subcategories.push({
                            id: subcategoryId,
                            name: doc.subcategory?.subcategory_name
                          });
                        }
                      }
                      return acc;
                    }, {})
                  ).map((groupedDoc, index) => (
                    <tr
                      key={`group-${groupedDoc.category_id}-${groupedDoc.user_id}`}
                      className={`${
                        index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                      } hover:bg-orange-100 transition duration-200`}
                    >
                      <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                        {groupedDoc.category_name || 
                         categories.find((c) => c.category_id === groupedDoc.category_id)?.category_name || 
                         groupedDoc.category_id}
                      </td>
                      <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {groupedDoc.subcategories?.map((sub, idx) => (
                            <span
                              key={sub.id || idx}
                              className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                            >
                              {sub.name || 
                               subcategories.find((s) => s.subcategory_id === sub.id)?.subcategory_name || 
                               sub.id}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                        {getEmployeeName(groupedDoc.user_id)}
                      </td>
                      <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                        <button
                          onClick={() => handleEdit(groupedDoc)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(groupedDoc.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No documents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal />
    </div>
  );
};

export default Employee;
