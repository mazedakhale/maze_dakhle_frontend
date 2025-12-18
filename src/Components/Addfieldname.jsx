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
      
      fetchFields();
      setModalOpen(false);
      setFormData({ category_id: "", subcategory_id: "", document_fields: "" });
      setMultipleFields([""]);
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

  // Group fields by category and subcategory
  const groupedFields = fields.reduce((acc, field) => {
    const key = `${field.category.category_id}-${field.subcategory.subcategory_id}`;
    if (!acc[key]) {
      acc[key] = {
        category: field.category,
        subcategory: field.subcategory,
        fields: []
      };
    }
    acc[key].fields.push(field);
    return acc;
  }, {});

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

        {/* Cards Display */}
        <div className="p-6 space-y-6">
          {Object.keys(groupedFields).length > 0 ? (
            Object.values(groupedFields).map((group, groupIndex) => (
              <div
                key={`${group.category.category_id}-${group.subcategory.subcategory_id}`}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {group.category.category_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Subcategory: {group.subcategory.subcategory_name}
                      </p>
                    </div>
                    <div className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full">
                      {group.fields.length} field{group.fields.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Field Names List */}
                <div className="p-4">
                  <div className="grid gap-3">
                    {group.fields.map((field, fieldIndex) => (
                      <div
                        key={field.id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${fieldIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          hover:bg-orange-50 transition duration-200
                        `}
                      >
                        <div className="flex-1">
                          {editId === field.id ? (
                            <input
                              type="text"
                              value={editableField}
                              onChange={(e) => setEditableField(e.target.value)}
                              className="border border-gray-400 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                              autoFocus
                            />
                          ) : (
                            <span className="text-gray-800 font-medium">
                              {field.document_fields}
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          {editId === field.id ? (
                            <>
                              <button
                                onClick={() => handleSave(field.id)}
                                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition duration-200 flex items-center"
                                title="Save"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => {
                                  setEditId(null);
                                  setEditableField("");
                                }}
                                className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center"
                                title="Cancel"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(field)}
                              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(field.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition duration-200 flex items-center"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500">
                <FaPlus className="mx-auto mb-4 text-4xl" />
                <h3 className="text-lg font-medium mb-2">No field names found</h3>
                <p className="text-sm">Add your first field name using the button above.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Field Name Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-[450px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Add Multiple Field Names
              </h3>
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
