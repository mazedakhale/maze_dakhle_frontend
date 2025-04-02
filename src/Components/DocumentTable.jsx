import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const DocumentTable = () => {
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ doc_type_name: "", description: "" }); // Added description field
  const [editingDoc, setEditingDoc] = useState(null);

  // Fetch documents from the API
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("https://mazedakhale.in:3000/document-types");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (add or edit document)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        // Update existing document
        await axios.put(
          `https://mazedakhale.in:3000/document-types/${editingDoc.doc_type_id}`,
          formData
        );
      } else {
        // Add new document
        await axios.post("https://mazedakhale.in:3000/document-types/", formData);
      }
      setIsModalOpen(false);
      fetchDocuments(); // Refresh the document list
      setFormData({ doc_type_name: "", description: "" }); // Reset form data
      setEditingDoc(null);
    } catch (error) {
      console.error("Error submitting document:", error);
    }
  };

  // Handle document deletion
  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This document will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`https://mazedakhale.in:3000/document-types/${id}`);
        fetchDocuments(); // Refresh the document list
        Swal.fire("Deleted!", "Document has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting document:", error);
        Swal.fire("Error", "Failed to delete document", "error");
      }
    }
  };

  // Handle editing a document
  const handleEdit = (doc) => {
    setFormData({ doc_type_name: doc.doc_type_name, description: doc.description }); // Set form data with description
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="ml-[330px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      {/* Right Section - Document Table */}
      <div className="w-full">
        <div className="w-full max-w-8xl bg-white p-6 shadow-lg">
          {/* Header and Button in Same Row */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Services</h2>
            <button
              className="bg-[#00234E] text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus className="mr-2" /> Add Document
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-300 rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead className="bg-gray-300 sticky top-0">
                <tr>
                  <th className="p-3 text-left border-r border-gray-400">ID</th>
                  <th className="p-3 text-left border-r border-gray-400">Document Name</th>
                  <th className="p-3 text-left border-r border-gray-400">Description</th>
                  <th className="p-3 text-left border-r border-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <tr
                      key={doc.doc_type_id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition-colors`}
                    >
                      <td className="p-3 text-left border border-gray-300">{doc.doc_type_id}</td>
                      <td className="p-3 text-left border border-gray-300">{doc.doc_type_name}</td>
                      <td className="p-3 text-left border border-gray-300">{doc.description}</td>
                      <td className="p-3 text-left border border-gray-300 gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.doc_type_id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-500 border border-gray-300">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Adding/Editing Documents */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{editingDoc ? "Edit Document" : "Add Document"}</h2>
            <form onSubmit={handleSubmit}>
              {/* Document Name Field */}
              <label className="block mb-2">Document Name:</label>
              <input
                type="text"
                name="doc_type_name"
                value={formData.doc_type_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg mb-4"
              />

              {/* Description Field */}
              <label className="block mb-2">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                rows={3}
              />

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDoc(null);
                    setFormData({ doc_type_name: "", description: "" }); // Reset form data
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#00234E] text-white rounded">
                  {editingDoc ? "Update" : "Add"} Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;