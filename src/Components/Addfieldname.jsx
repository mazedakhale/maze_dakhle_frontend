// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  // Fetch fields and categories
  useEffect(() => {
    fetchFields();
    fetchCategories();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get(
        "https://mazedakhale.in/api/field-names"
      );
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://mazedakhale.in/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await axios.get(
        `https://mazedakhale.in/api/subcategories/category/${categoryId}`
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
    const confirmDelete = await Swal.fire({
      title: "Enter Deletion Code",
      text: "Please enter the code to confirm deletion.",
      input: "text",
      inputPlaceholder: "Enter code here...",
      inputAttributes: { autocapitalize: "off" },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      showLoaderOnConfirm: true,
      preConfirm: (inputValue) => {
        if (inputValue !== "0000") {
          Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
          return false;
        }
        return true;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (confirmDelete.isConfirmed) {
      // **Remove the field from UI immediately**
      setFields((prevFields) => prevFields.filter((field) => field.id !== id));

      // **Show success message instantly**
      Swal.fire("Deleted!", "Field Name deleted successfully", "success");

      // **Perform API call in the background**
      axios
        .delete(`https://mazedakhale.in/api/field-names/${id}`)
        .then(() => {
          fetchFields(); // Refresh field list
        })
        .catch((error) => {
          console.error("Error deleting field:", error);
          Swal.fire("Error!", "Failed to delete Field Name", "error");
        });
    }
  };

  const handleEdit = (field) => {
    setEditId(field.id);
    setEditableField(field.document_fields);
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`https://mazedakhale.in/api/field-names/${id}`, {
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
      await axios.post("https://mazedakhale.in/api/field-names", formData);
      Swal.fire("Added!", "Field Name added successfully", "success");
      fetchFields();
      setModalOpen(false);
      setFormData({ category_id: "", subcategory_id: "", document_fields: "" });
      setEditId(null);
    } catch (error) {
      Swal.fire("Error!", "Failed to save Field Name", "error");
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
          <div className="p-6 bg-white rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-semibold mb-4">Add Field Name</h3>
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
              <input
                type="text"
                className="border border-gray-300 p-2 rounded w-full mb-4"
                placeholder="Field Name"
                value={formData.document_fields}
                onChange={(e) =>
                  setFormData({ ...formData, document_fields: e.target.value })
                }
              />
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
