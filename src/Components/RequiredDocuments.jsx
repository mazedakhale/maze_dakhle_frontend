import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
const RequiredDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [multipleDocuments, setMultipleDocuments] = useState([{ name: "", file: null }]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    document_names: "",
    file: null, // Add file field
  });
  const [editId, setEditId] = useState(null);

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
      if (editId) {
        // Edit mode - single document
        if (!formData.document_names.trim()) {
          Swal.fire("Error!", "Please enter a document name", "error");
          setSubmitDisabled(false);
          return;
        }

        if (!formData.file) {
          Swal.fire("Error!", "Please select a file to upload", "error");
          setSubmitDisabled(false);
          return;
        }

        // Check for existing document names in the same subcategory (excluding current document)
        const existingDocsInSubcategory = documents.filter(doc => 
          doc.subcategory.subcategory_id.toString() === formData.subcategory_id &&
          doc.id !== editId
        );

        const existingDocNames = existingDocsInSubcategory.map(doc => 
          doc.document_names.toLowerCase().trim()
        );

        if (existingDocNames.includes(formData.document_names.toLowerCase().trim())) {
          Swal.fire({
            icon: "error",
            title: "Document Name Already Exists!",
            text: `The document name "${formData.document_names}" already exists in this subcategory`,
            confirmButtonColor: "#f58a3b",
          });
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

        await axios.patch(`${API_BASE_URL}/required-documents/${editId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        });

        Swal.fire("Success!", "Document updated successfully", "success");
      } else {
        // Add mode - multiple documents
        const validDocuments = multipleDocuments.filter(doc => doc.name.trim() !== "");
        if (validDocuments.length === 0) {
          Swal.fire("Error!", "Please add at least one document name", "error");
          setSubmitDisabled(false);
          return;
        }

        // Check if all valid documents have files
        const documentsWithoutFiles = validDocuments.filter(doc => !doc.file);
        if (documentsWithoutFiles.length > 0) {
          const missingFileNames = documentsWithoutFiles.map((doc, index) => 
            doc.name || `Document ${multipleDocuments.indexOf(doc) + 1}`
          ).join(", ");
          Swal.fire("Error!", `Please select files for the following documents: ${missingFileNames}`, "error");
          setSubmitDisabled(false);
          return;
        }

        // Check for duplicates within the input documents
        const docCounts = {};
        const duplicateDocs = [];
        
        validDocuments.forEach(doc => {
          const trimmedDocName = doc.name.trim().toLowerCase();
          if (docCounts[trimmedDocName]) {
            duplicateDocs.push(doc.name.trim());
          } else {
            docCounts[trimmedDocName] = 1;
          }
        });

        if (duplicateDocs.length > 0) {
          Swal.fire("Error!", `Duplicate document names detected: ${duplicateDocs.join(", ")}`, "error");
          setSubmitDisabled(false);
          return;
        }

        // Check for existing document names in the same subcategory
        const existingDocsInSubcategory = documents.filter(doc => 
          doc.subcategory.subcategory_id.toString() === formData.subcategory_id
        );

        const existingDocNames = existingDocsInSubcategory.map(doc => 
          doc.document_names.toLowerCase().trim()
        );

        const conflictingDocs = validDocuments.filter(newDoc => 
          existingDocNames.includes(newDoc.name.toLowerCase().trim())
        );

        if (conflictingDocs.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Document Names Already Exist!",
            text: `The following document names already exist in this subcategory: ${conflictingDocs.map(doc => doc.name).join(", ")}`,
            confirmButtonColor: "#f58a3b",
          });
          setSubmitDisabled(false);
          return;
        }
        
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
            
            const response = await axios.post(`${API_BASE_URL}/required-documents`, formDataToSend, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              timeout: 30000,
            });
            console.log("Document created:", response.data);
            
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
      }
      
      setModalOpen(false);
      setFormData({
        category_id: "",
        subcategory_id: "",
        document_names: "",
        file: null,
      });
      setMultipleDocuments([{ name: "", file: null }]);
      setEditId(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting document:", error);
      const errorMessage = error.response?.data?.message || "Failed to save document(s)";
      if (error.code === "ECONNABORTED") {
        Swal.fire("Error!", "Request timed out. Please try again.", "error");
      } else {
        Swal.fire("Error!", errorMessage, "error");
      }
    } finally {
      setSubmitDisabled(false);
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

  // Group documents by category and subcategory
  const groupedDocuments = documents.reduce((acc, document) => {
    const categoryId = document.category?.category_id || 'no-category';
    const subcategoryId = document.subcategory?.subcategory_id || 'no-subcategory';
    const key = `${categoryId}-${subcategoryId}`;
    if (!acc[key]) {
      acc[key] = {
        category: document.category || { category_id: '', category_name: 'N/A' },
        subcategory: document.subcategory || { subcategory_id: '', subcategory_name: 'N/A' },
        documents: []
      };
    }
    acc[key].documents.push(document);
    return acc;
  }, {});

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
            onClick={() => {
              setEditId(null);
              setFormData({
                category_id: "",
                subcategory_id: "",
                document_names: "",
                file: null,
              });
              setMultipleDocuments([{ name: "", file: null }]);
              setModalOpen(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Document
          </button>
        </div>

        {/* Cards Display */}
        <div className="p-6 space-y-6">
          {Object.keys(groupedDocuments).length > 0 ? (
            Object.values(groupedDocuments).map((group) => (
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
                      {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-4">
                  <div className="grid gap-3">
                    {group.documents.map((doc, docIndex) => (
                      <div
                        key={doc.id}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border
                          ${docIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          hover:bg-orange-50 transition duration-200
                        `}
                      >
                        <div className="flex-1">
                          <div className="space-y-2">
                            <span className="text-gray-800 font-medium block">
                              {doc.document_names}
                            </span>
                            <div className="flex items-center space-x-4">
                              {doc.file_url ? (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline text-sm flex items-center"
                                >
                                  📄 View File
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No file uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
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
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-sm">Add your first document using the button above.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editId ? "Edit Document" : "Add Multiple Documents"}
              </h3>
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
              
              {editId ? (
                <>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                    placeholder="Enter document name"
                    value={formData.document_names}
                    onChange={(e) =>
                      setFormData({ ...formData, document_names: e.target.value })
                    }
                    required
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Upload <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      className="border border-gray-300 p-2 rounded w-full"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents (Add Multiple) <span className="text-red-500">* All fields required</span>
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
                        placeholder={`Document Name ${index + 1} *`}
                        value={document.name}
                        onChange={(e) => updateDocumentValue(index, 'name', e.target.value)}
                        required
                      />
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          File Upload <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          className="border border-gray-300 p-2 rounded w-full"
                          onChange={(e) => updateDocumentValue(index, 'file', e.target.files[0])}
                          required
                        />
                      </div>
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
                  onClick={() => {
                    setModalOpen(false);
                    setEditId(null);
                    setFormData({
                      category_id: "",
                      subcategory_id: "",
                      document_names: "",
                      file: null,
                    });
                    setMultipleDocuments([{ name: "", file: null }]);
                  }}
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
