import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Addsubcategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState({
    subcategory_name: "",
    category_id: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // Update the API_BASE_URL to match the backend URL
  const API_BASE_URL = "http://72.60.206.65:3000";

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchSubcategories();
    };
    
    loadInitialData();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subcategories`);
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      // Sort categories by name for better UX
      const sortedCategories = response.data.sort((a, b) =>
        a.category_name.localeCompare(b.category_name)
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Failed to load categories", "error");
    }
  };

  const addSubcategory = async () => {
    // Validate both fields
    if (!newSubcategory.subcategory_name.trim()) {
      Swal.fire("Error", "Please enter a subcategory name", "error");
      return;
    }
    
    if (!newSubcategory.category_id) {
      Swal.fire("Error", "Please select a category", "error");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/subcategories`, newSubcategory);
      await fetchSubcategories(); // Refresh the list
      setNewSubcategory({ subcategory_name: "", category_id: "" });
      setIsAdding(false);
      Swal.fire("Success", "Subcategory added successfully!", "success");
    } catch (error) {
      console.error("Error adding subcategory:", error);
      Swal.fire("Error", "Failed to add subcategory", "error");
    }
  };

  const handleEditSubcategory = (id, name) => {
    setEditingId(id);
    setUpdatedName(name);
  };

  const updateSubcategory = async (id) => {
    if (!updatedName.trim()) {
      Swal.fire("Error", "Subcategory name cannot be empty!", "error");
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/subcategories/${id}`, {
        subcategory_name: updatedName,
      });

      setSubcategories((prev) =>
        prev.map((sub) =>
          sub.subcategory_id === id
            ? { ...sub, subcategory_name: updatedName }
            : sub
        )
      );

      setEditingId(null);
      setUpdatedName("");
      Swal.fire("Updated", "Subcategory updated successfully!", "success");
    } catch (error) {
      console.error("Error updating subcategory:", error);
      Swal.fire("Error", "Failed to update subcategory", "error");
    }
  };

  const deleteSubcategory = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Enter Deletion Code",
      text: "Please enter the code to confirm deletion.",
      input: "text",
      inputPlaceholder: "Enter code here...",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      preConfirm: (inputValue) => {
        if (inputValue !== "0000") {
          Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
          return false;
        }
        return true;
      },
    });

    if (confirmDelete.isConfirmed) {
      Swal.fire("Deleted!", "Subcategory has been deleted.", "success");

      try {
        await axios.delete(`${API_BASE_URL}/subcategories/${id}`);
        setSubcategories((prev) =>
          prev.filter((sub) => sub.subcategory_id !== id)
        );
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        Swal.fire("Error", "Failed to delete subcategory", "error");
      }
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            SubCategory List
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
            onClick={() => setIsAdding(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Subcategory
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["ID", "Subcategory Name", "Actions"].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subcategories.length > 0 ? (
                subcategories.map((sub, index) => (
                  <tr
                    key={sub.subcategory_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {sub.subcategory_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === sub.subcategory_id ? (
                        <input
                          type="text"
                          value={updatedName}
                          onChange={(e) => setUpdatedName(e.target.value)}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : (
                        sub.subcategory_name
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === sub.subcategory_id ? (
                        <button
                          onClick={() => updateSubcategory(sub.subcategory_id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded mr-2 hover:bg-orange-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleEditSubcategory(
                              sub.subcategory_id,
                              sub.subcategory_name
                            )
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubcategory(sub.subcategory_id)}
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
                    colSpan="3"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No subcategories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Subcategory
            </h2>

            {/* Category Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newSubcategory.category_id}
                onChange={(e) =>
                  setNewSubcategory({
                    ...newSubcategory,
                    category_id: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              >
                <option value="">Select Category</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
            </div>

            {/* Subcategory Input */}
            <input
              type="text"
              placeholder="Enter Subcategory Name"
              value={newSubcategory.subcategory_name}
              onChange={(e) =>
                setNewSubcategory({
                  ...newSubcategory,
                  subcategory_name: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addSubcategory}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addsubcategory;
