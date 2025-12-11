import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
const RequiredDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [multipleDocuments, setMultipleDocuments] = useState([{ name: "", file: null }]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    document_names: "",
    file: null, // Add file field
  });
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState("");

  // Fetch required documents and categories
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/required-documents`
      );
      // Add default values for category and subcategory if they are null
      const documentsWithDefaults = response.data.map((doc) => ({
        ...doc,
        category: doc.category || { category_id: "", category_name: "N/A" },
        subcategory: doc.subcategory || {
          subcategory_id: "",
          subcategory_name: "N/A",
        },
      }));
      setDocuments(documentsWithDefaults);
    } catch (error) {
      console.error("Error fetching documents:", error);
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
      setSubcategories([]);
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

      await axios.delete(`${API_BASE_URL}/required-documents/${id}`, {
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
      console.error("Error deleting document:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete document";
      
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

  const handleEdit = (doc) => {
    setEditId(doc.id);
    setEditedName(doc.document_names);
    setFormData({
      category_id: doc.category ? doc.category.category_id : "",
      subcategory_id: doc.subcategory ? doc.subcategory.subcategory_id : "",
      document_names: doc.document_names,
      file: null, // Reset file input
    });
    if (doc.category) {
      fetchSubcategories(doc.category.category_id);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitDisabled(true);

    // Validate category and subcategory
    if (!formData.category_id || !formData.subcategory_id) {
      Swal.fire("Error!", "Please select a category and subcategory.", "error");
      setSubmitDisabled(false);
      return;
    }

    try {
      if (isBulkMode) {
        // Filter out empty documents
        const validDocuments = multipleDocuments.filter(doc => doc.name.trim() !== "");
        if (validDocuments.length === 0) {
          Swal.fire("Error!", "Please add at least one document name", "error");
          setSubmitDisabled(false);
          return;
        }
        
        // Use sequential API calls since bulk endpoint doesn't exist
        let successCount = 0;
        let errorCount = 0;
        
        for (const doc of validDocuments) {
          try {
            const formDataToSend = new FormData();
            formDataToSend.append("category_id", formData.category_id);
            formDataToSend.append("subcategory_id", formData.subcategory_id);
            formDataToSend.append("document_names", doc.name);
            if (doc.file) {
              formDataToSend.append("file", doc.file);
            }
            
            await axios.post(`${API_BASE_URL}/required-documents`, formDataToSend, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              timeout: 30000,
            });
            
            successCount++;
          } catch (error) {
            console.error("Error creating document:", error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          Swal.fire("Success!", `${successCount} Documents added successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`, "success");
        } else {
          Swal.fire("Error!", "Failed to add any documents", "error");
        }
      } else {
        // Validate that a file is uploaded for new documents
        if (!editId && !formData.file) {
          Swal.fire("Error!", "Please upload a file.", "error");
          setSubmitDisabled(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("category_id", formData.category_id);
        formDataToSend.append("subcategory_id", formData.subcategory_id);
        formDataToSend.append("document_names", formData.document_names);
        if (formData.file) {
          formDataToSend.append("file", formData.file);
        }

        const url = editId
          ? `${API_BASE_URL}/required-documents/${editId}`
          : `${API_BASE_URL}/required-documents`;

        const method = editId ? "patch" : "post";

        const response = await axios[method](url, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        });

        Swal.fire(
          "Success!",
          `Document ${editId ? "updated" : "added"} successfully`,
          "success"
        );
      }
      
      setModalOpen(false);
      setFormData({
        category_id: "",
        subcategory_id: "",
        document_names: "",
        file: null,
      });
      setMultipleDocuments([{ name: "", file: null }]);
      setIsBulkMode(false);
      setEditId(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting document:", error);
      const errorMessage = error.response?.data?.message || `Failed to ${editId ? "update" : "add"} document(s)`;
      if (error.code === "ECONNABORTED") {
        Swal.fire("Error!", "Request timed out. Please try again.", "error");
      } else {
        Swal.fire("Error!", errorMessage, "error");
      }
    } finally {
      setSubmitDisabled(false);
      setEditId(null);
    }
  };

  const addDocumentInput = () => {
    setMultipleDocuments([...multipleDocuments, { name: "", file: null }]);
  };

  const removeDocumentInput = (index) => {
    if (multipleDocuments.length > 1) {
      const newDocuments = multipleDocuments.filter((_, i) => i !== index);
      setMultipleDocuments(newDocuments);
    }
  };

  const updateDocumentValue = (index, field, value) => {
    const newDocuments = [...multipleDocuments];
    newDocuments[index][field] = value;
    setMultipleDocuments(newDocuments);
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (!isBulkMode) {
      setMultipleDocuments([{ name: "", file: null }]);
    } else {
      setFormData({ ...formData, document_names: "", file: null });
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Required Documents List
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
            <FaPlus /> Add Document
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "Document Names",
                  "Category",
                  "Subcategory",
                  "File URL",
                  "Actions",
                ].map((header, index) => (
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
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {/* {editId === doc.id ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : ( */}
                        {doc.document_names}
                      {/* )} */}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.category ? doc.category.category_name : "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.subcategory
                        ? doc.subcategory.subcategory_name
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View File
                        </a>
                      ) : (
                        "No file uploaded"
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {/* {editId === doc.id ? (
                        <button
                          onClick={() => handleSubmit(doc.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        >
                          <FaSave />
                        </button>
                      ) : ( */}
                        <button
                          onClick={() => handleEdit(doc)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      {/* )} */}
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
                  <td
                    colSpan="5"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editId ? "Edit Document" : isBulkMode ? "Add Multiple Documents" : "Add Document"}
              </h3>
              {!editId && (
                <button
                  type="button"
                  onClick={toggleBulkMode}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  {isBulkMode ? "Single Mode" : "Bulk Mode"}
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <select
                className="border border-gray-300 p-2 rounded w-full mb-4"
                value={formData.category_id}
                onChange={handleCategoryChange}
                disabled={editId}
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
                disabled={editId}
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
              
              {isBulkMode && !editId ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents (Add Multiple)
                  </label>
                  {multipleDocuments.map((document, index) => (
                    <div key={index} className="border border-gray-200 p-3 rounded mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Document {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeDocumentInput(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                          disabled={multipleDocuments.length === 1}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded w-full mb-2"
                        placeholder={`Document Name ${index + 1}`}
                        value={document.name}
                        onChange={(e) => updateDocumentValue(index, 'name', e.target.value)}
                      />
                      <input
                        type="file"
                        className="border border-gray-300 p-2 rounded w-full"
                        onChange={(e) => updateDocumentValue(index, 'file', e.target.files[0])}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDocumentInput}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Another Document
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                    placeholder="Enter document name"
                    value={formData.document_names}
                    onChange={(e) =>
                      setFormData({ ...formData, document_names: e.target.value })
                    }
                  />
                  {/* Show File Upload Only for Adding New Documents */}
                  {!editId && (
                    <input
                      type="file"
                      className="border border-gray-300 p-2 rounded w-full mb-4"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                      required
                    />
                  )}
                </>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={` text-white px-4 py-2 rounded ${!submitDisabled ? "bg-orange-500 hover:bg-orange-600":"bg-gray-500 hover:bg-gray-600"}`}
                >
                  {submitDisabled ? "Submitting..." : ""}
                  {!submitDisabled && `${editId ? "Update" : "Save"}`}
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
export default RequiredDocuments;
