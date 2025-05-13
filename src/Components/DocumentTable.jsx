import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const DocumentTable = () => {
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doc_type_name: "",
    description: "",
  });
  const [editingDoc, setEditingDoc] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get(
        "https://mazedakhale.in/api/document-types"
      );
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleChange = (e) =>
    setFormData((fd) => ({ ...fd, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await axios.put(
          `https://mazedakhale.in/api/document-types/${editingDoc.doc_type_id}`,
          formData
        );
      } else {
        await axios.post(
          "https://mazedakhale.in/api/document-types/",
          formData
        );
      }
      setIsModalOpen(false);
      setEditingDoc(null);

      setFormData({ doc_type_name: "", description: "" });
      fetchDocuments();
      Swal.fire("Success", "Document saved!", "success");
    } catch {
      Swal.fire("Error", "Failed to save document", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This document will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`https://mazedakhale.in/api/document-types/${id}`);
        fetchDocuments();
        Swal.fire("Deleted!", "Document has been deleted.", "success");
      } catch {
        Swal.fire("Error", "Failed to delete document", "error");
      }
    }
  };

  const handleEdit = (doc) => {
    setFormData({
      doc_type_name: doc.doc_type_name,
      description: doc.description,
    });
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Services List
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
            className="bg-[#00234E] text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus className="mr-2" /> Add Document
          </button>
        </div>

        {/* TABLE */}
        <div className="p-6 overflow-x-auto">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-300 sticky top-0">
                <tr>
                  {["ID", "Document Name", "Description", "Actions"].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="p-3 border border-gray-400 text-left font-semibold"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <tr
                      key={doc.doc_type_id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="p-3 border border-gray-300">
                        {doc.doc_type_id}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {doc.doc_type_name}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {doc.description}
                      </td>
                      <td className="p-3 border border-gray-300 flex gap-4">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.doc_type_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-500 border border-gray-300"
                    >
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
              {/* Modal Close */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingDoc(null);
                  setFormData({ doc_type_name: "", description: "" });
                }}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              >
                <FaTimes size={18} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                {editingDoc ? "Edit Document" : "Add Document"}
              </h2>
              <form onSubmit={handleSubmit}>
                <label className="block mb-2">Document Name:</label>
                <input
                  name="doc_type_name"
                  value={formData.doc_type_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-2">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded mb-4"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingDoc(null);
                      setFormData({ doc_type_name: "", description: "" });
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00234E] text-white rounded"
                  >
                    {editingDoc ? "Update" : "Add"} Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTable;
