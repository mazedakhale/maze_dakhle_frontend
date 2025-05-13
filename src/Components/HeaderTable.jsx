import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const HeaderTable = () => {
  const [headerList, setHeaderList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: "" });
  const [editingItem, setEditingItem] = useState(null);

  const navigate = useNavigate();
  const apiUrl = "https://mazedakhale.in/api/header";

  useEffect(() => {
    fetchHeaders();
  }, []);

  const fetchHeaders = async () => {
    try {
      const { data } = await axios.get(apiUrl);
      setHeaderList(data);
    } catch (error) {
      console.error("Error fetching headers:", error);
    }
  };

  const handleChange = (e) =>
    setFormData((fd) => ({ ...fd, [e.target.name]: e.target.value }));

  const openModalForAdd = () => {
    setEditingItem(null);
    setFormData({ description: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${apiUrl}/${editingItem.id}`, formData);
      } else {
        await axios.post(apiUrl, formData);
      }
      setIsModalOpen(false);
      fetchHeaders();
      Swal.fire("Success", "Header saved!", "success");
    } catch {
      Swal.fire("Error", "Failed to save header", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This header will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        fetchHeaders();
        Swal.fire("Deleted!", "Header has been deleted.", "success");
      } catch {
        Swal.fire("Error", "Failed to delete header", "error");
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ description: item.description });
    setIsModalOpen(true);
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#FFF7E6] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Header Banner Text
          </h2>
          <button
            onClick={() => navigate("/Adashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Add Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={openModalForAdd}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Header
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm bg-white shadow-md rounded-md">
            <thead className="bg-orange-100 border-b-2 border-orange-400">
              <tr>
                {["ID", "Description", "Created At", "Actions"].map(
                  (h, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 border border-gray-300 text-black font-semibold text-center"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {headerList.length > 0 ? (
                headerList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-orange-50 transition-colors`}
                  >
                    <td className="px-4 py-3 border border-gray-300 text-center">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 border border-gray-300">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-orange-500 hover:text-orange-700"
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
                    No headers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({ description: "" });
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              {editingItem ? "Edit Header" : "Add Header"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setFormData({ description: "" });
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                  {editingItem ? "Update" : "Add"} Header
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderTable;
