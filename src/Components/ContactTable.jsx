import React, { useState, useEffect } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ContactTable = () => {
  const [key, setKey] = useState("");
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedKey, setUpdatedKey] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const apiUrl = "https://mazedakhale.in/api/field";

  // Fetch all fields
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get(apiUrl);
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching fields:", error);
      Swal.fire("Error", "Failed to fetch fields", "error");
    }
  };

  // Add a new field (key only)
  const handleAddField = async () => {
    if (!key.trim()) {
      Swal.fire("Error", "Key cannot be empty!", "error");
      return;
    }

    try {
      await axios.post(apiUrl, { key }); // Only send the key
      setKey("");
      setIsAdding(false);
      fetchFields(); // Refresh the list of fields
      Swal.fire("Success", "Field added successfully!", "success");
    } catch (error) {
      console.error("Error adding field:", error);
      Swal.fire("Error", "Failed to add field", "error");
    }
  };

  // Update an existing field
  const handleUpdateField = async (id) => {
    if (!updatedKey.trim()) {
      Swal.fire("Error", "Key cannot be empty!", "error");
      return;
    }

    try {
      await axios.put(`${apiUrl}/${id}`, { key: updatedKey });
      setEditingId(null);
      setUpdatedKey("");
      fetchFields(); // Refresh the list of fields
      Swal.fire("Success", "Field updated successfully!", "success");
    } catch (error) {
      console.error("Error updating field:", error);
      Swal.fire("Error", "Failed to update field", "error");
    }
  };

  // Delete a field
  const handleDeleteField = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this field. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",

      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        fetchFields(); // Refresh the list of fields
        Swal.fire("Deleted!", "Field has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting field:", error);
        Swal.fire("Error", "Failed to delete field", "error");
      }
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Contact Field List
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
            <FaPlus /> Add Field
          </button>
        </div>
        {/* Fields Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["ID", "Key", "Actions"].map((header, index) => (
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
              {fields.length > 0 ? (
                fields.map((field) => (
                  <tr
                    key={field.id}
                    className="hover:bg-orange-100 transition duration-200"
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {field.id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === field.id ? (
                        <input
                          type="text"
                          value={updatedKey}
                          onChange={(e) => setUpdatedKey(e.target.value)}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : (
                        field.key
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === field.id ? (
                        <button
                          onClick={() => handleUpdateField(field.id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded mr-2 hover:bg-orange-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(field.id);
                            setUpdatedKey(field.key);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteField(field.id)}
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
                    No fields found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Field Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Field</h2>

            <input
              type="text"
              placeholder="Enter Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <button
              onClick={handleAddField}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactTable;
