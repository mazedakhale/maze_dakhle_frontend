// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
const FieldNames = () => {
  const [fields, setFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    document_fields: "",
  });

  const [editId, setEditId] = useState(null);
  const [editableField, setEditableField] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [multipleFields, setMultipleFields] = useState([""]);
  const navigate = useNavigate();
  // Fetch fields and categories
  useEffect(() => {
    fetchFields();
    fetchCategories();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/field-names`);
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subcategories/category/${categoryId}`
      );
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]); // Clear on error
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setFormData({
      ...formData,
      category_id: selectedCategoryId,
      subcategory_id: "",
    });
    fetchSubcategories(selectedCategoryId);
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

      await axios.delete(`${API_BASE_URL}/field-names/${id}`, {
        data: { code: codeResult.value }
      });

      setFields((prevFields) => prevFields.filter((field) => field.id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Field Name deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting field name:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete field name";
      
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

  const handleEdit = (field) => {
    setEditId(field.id);
    setEditableField(field.document_fields);
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/field-names/${id}`, {
        document_fields: editableField,
      });
      Swal.fire("Updated!", "Field Name updated successfully", "success");
      setEditId(null);
      setEditableField("");
      fetchFields();
    } catch (error) {
      Swal.fire("Error!", "Failed to update Field Name", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isBulkMode) {
        // Filter out empty fields
        const validFields = multipleFields.filter(field => field.trim() !== "");
        if (validFields.length === 0) {
          Swal.fire("Error!", "Please add at least one field name", "error");
          return;
        }
        
        const bulkData = {
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          document_fields: validFields
        };
        
        await axios.post(`${API_BASE_URL}/field-names/bulk`, bulkData);
        Swal.fire("Added!", `${validFields.length} Field Names added successfully`, "success");
      } else {
        await axios.post(`${API_BASE_URL}/field-names`, formData);
        Swal.fire("Added!", "Field Name added successfully", "success");
      }
      
      fetchFields();
      setModalOpen(false);
      setFormData({ category_id: "", subcategory_id: "", document_fields: "" });
      setMultipleFields([""]);
      setIsBulkMode(false);
      setEditId(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save Field Name(s)";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const addFieldInput = () => {
    setMultipleFields([...multipleFields, ""]);
  };

  const removeFieldInput = (index) => {
    if (multipleFields.length > 1) {
      const newFields = multipleFields.filter((_, i) => i !== index);
      setMultipleFields(newFields);
    }
  };

  const updateFieldValue = (index, value) => {
    const newFields = [...multipleFields];
    newFields[index] = value;
    setMultipleFields(newFields);
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (!isBulkMode) {
      setMultipleFields([""]);
    } else {
      setFormData({ ...formData, document_fields: "" });
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Fields List
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
            onClick={() => setModalOpen(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Field Names
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["Field Name", "Category", "Subcategory", "Actions"].map(
                  (header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {fields.length > 0 ? (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editId === field.id ? (
                        <input
                          type="text"
                          value={editableField}
                          onChange={(e) => setEditableField(e.target.value)}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : (
                        field.document_fields
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {field.category.category_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {field.subcategory.subcategory_name}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editId === field.id ? (
                        <button
                          onClick={() => handleSave(field.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        >
                          <FaSave />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(field)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(field.id)}
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
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No field names found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Field Name Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-[450px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isBulkMode ? "Add Multiple Field Names" : "Add Field Name"}
              </h3>
              <button
                type="button"
                onClick={toggleBulkMode}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                {isBulkMode ? "Single Mode" : "Bulk Mode"}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <select
                className="border border-gray-300 p-2 rounded w-full mb-4"
                value={formData.category_id}
                onChange={handleCategoryChange}
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
              <select
                className="border border-gray-300 p-2 rounded w-full mb-4"
                value={formData.subcategory_id}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory_id: e.target.value })
                }
                disabled={!formData.category_id}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option
                    key={subcategory.subcategory_id}
                    value={subcategory.subcategory_id}
                  >
                    {subcategory.subcategory_name}
                  </option>
                ))}
              </select>
              {isBulkMode ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Names (Add Multiple)
                  </label>
                  {multipleFields.map((field, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded flex-1 mr-2"
                        placeholder={`Field Name ${index + 1}`}
                        value={field}
                        onChange={(e) => updateFieldValue(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFieldInput(index)}
                        className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        disabled={multipleFields.length === 1}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFieldInput}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Another Field
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded w-full mb-4"
                  placeholder="Field Name"
                  value={formData.document_fields}
                  onChange={(e) =>
                    setFormData({ ...formData, document_fields: e.target.value })
                  }
                />
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldNames;
