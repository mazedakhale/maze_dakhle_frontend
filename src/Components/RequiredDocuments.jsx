import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaSave } from "react-icons/fa";

const RequiredDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    document_names: "",
  });
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState(""); // New state for inline editing

  // Fetch required documents and categories
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/required-documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories/category/${categoryId}`);
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setFormData({ ...formData, category_id: selectedCategoryId, subcategory_id: "" });
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
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (confirmDelete.isConfirmed) {
      // **Remove the document from UI immediately**
      setDocuments((prevDocuments) =>
        prevDocuments.filter((document) => document.id !== id)
      );

      // **Show success message instantly**
      Swal.fire("Deleted!", "Document deleted successfully", "success");

      // **Perform API call in the background**
      axios
        .delete(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/required-documents/${id}`)
        .then(() => {
          fetchDocuments(); // Refresh document list
        })
        .catch((error) => {
          console.error("Error deleting document:", error);
          Swal.fire("Error!", "Failed to delete document", "error");
        });
    }
  };


  const handleEdit = (doc) => {
    setEditId(doc.id);
    setEditedName(doc.document_names); // Set current document name for editing
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/required-documents/${id}`, {
        document_names: editedName,
      });
      Swal.fire("Updated!", "Document name updated successfully", "success");
      setEditId(null);
      fetchDocuments();
    } catch (error) {
      Swal.fire("Error!", "Failed to update document name", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/required-documents", formData);
      Swal.fire("Added!", "Document added successfully", "success");
      fetchDocuments();
      setModalOpen(false);
      setFormData({ category_id: "", subcategory_id: "", document_names: "" });
      setEditId(null);
    } catch (error) {
      Swal.fire("Error!", "Failed to save document", "error");
    }
  };

  return (
    <div className="ml-[330px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      {/* Required Documents Section */}
      <div className="w-full">
        <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
          {/* Header and Button in Same Row */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Required Documents</h2>
            <button onClick={() => setModalOpen(true)} className="bg-[#00234E] text-white px-4 py-2 rounded flex items-center hover:opacity-90 transition duration-200">
              <FaPlus className="mr-2" /> Add Document
            </button>
          </div>

          {/* Documents Table with Scroll */}
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-300 text-black">
                <tr>
                  <th className="p-3 text-left border-r border-gray-400">Document Names</th>
                  <th className="p-3 text-left border-r border-gray-400">Category</th>
                  <th className="p-3 text-left border-r border-gray-400">Subcategory</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <tr key={doc.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                      <td className="p-3 border-r border-gray-400">
                        {editId === doc.id ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          doc.document_names
                        )}
                      </td>
                      <td className="p-3 border-r border-gray-400">{doc.category.category_name}</td>
                      <td className="p-3 border-r border-gray-400">{doc.subcategory.subcategory_name}</td>
                      <td className="p-3 text-center">
                        {editId === doc.id ? (
                          <button
                            onClick={() => handleSave(doc.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            <FaSave />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(doc)}
                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      No documents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">{editId ? "Edit Document" : "Add Document"}</h3>
            <form onSubmit={handleSubmit}>
              <select
                className="border p-2 rounded w-full mb-4"
                value={formData.category_id}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <select
                className="border p-2 rounded w-full mb-4"
                value={formData.subcategory_id}
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                    {subcategory.subcategory_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="border p-2 rounded w-full mb-4"
                placeholder="Enter document names"
                value={formData.document_names}
                onChange={(e) => setFormData({ ...formData, document_names: e.target.value })}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
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

export default RequiredDocuments;
