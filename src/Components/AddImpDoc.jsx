import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaFile, FaLink, FaTimes, FaEye } from 'react-icons/fa';

const AddImpDoc = () => {
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    link_url: '',
    category: '',
    file: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/important-documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      Swal.fire('Error', 'Failed to fetch documents', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      Swal.fire('Error', 'Please enter a title', 'error');
      return;
    }

    if (formData.type === 'link' && !formData.link_url) {
      Swal.fire('Error', 'Please enter a link URL', 'error');
      return;
    }

    if (formData.type === 'document' && !formData.file && !isEditing) {
      Swal.fire('Error', 'Please upload a document', 'error');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('category', formData.category);
      
      if (formData.type === 'link') {
        data.append('link_url', formData.link_url);
      }
      
      if (formData.file) {
        data.append('file', formData.file);
      }

      if (isEditing && currentDoc) {
        await axios.put(`/api/important-documents/${currentDoc.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Swal.fire('Success', 'Document updated successfully!', 'success');
      } else {
        await axios.post('/api/important-documents', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Swal.fire('Success', 'Document added successfully!', 'success');
      }

      fetchDocuments();
      closeModal();
    } catch (error) {
      console.error('Error saving document:', error);
      Swal.fire('Error', 'Failed to save document', 'error');
    }
  };

  const handleEdit = (doc) => {
    setCurrentDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      type: doc.type,
      link_url: doc.link_url || '',
      category: doc.category || '',
      file: null,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this document?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/important-documents/${id}`);
        Swal.fire('Deleted!', 'Document has been deleted.', 'success');
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        Swal.fire('Error', 'Failed to delete document', 'error');
      }
    }
  };

  const toggleActive = async (doc) => {
    try {
      await axios.put(`/api/important-documents/${doc.id}`, {
        is_active: !doc.is_active,
      });
      Swal.fire('Success', `Document ${doc.is_active ? 'deactivated' : 'activated'}!`, 'success');
      fetchDocuments();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      type: 'document',
      link_url: '',
      category: '',
      file: null,
    });
    setCurrentDoc(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentDoc(null);
  };

  const handleViewDocument = (url) => {
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
      // Open Google Drive link directly
      window.open(url, '_blank');
    } else {
      // Local file path - append to localhost
      window.open(`/api${url}`, '_blank');
    }
  };

  return (
    <>
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b]">Important Documents</h2>
          <button
            onClick={openAddModal}
            className="bg-orange-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-orange-600 transition"
          >
            <FaPlus /> Add Document
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-center">Type</th>
                <th className="border p-3 text-left">Category</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50`}
                  >
                    <td className="border p-3">{doc.title}</td>
                    <td className="border p-3">{doc.description || 'N/A'}</td>
                    <td className="border p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          doc.type === 'document'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {doc.type === 'document' ? <FaFile className="inline mr-1" /> : <FaLink className="inline mr-1" />}
                        {doc.type}
                      </span>
                    </td>
                    <td className="border p-3">{doc.category || 'General'}</td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => toggleActive(doc)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          doc.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex justify-center gap-2">
                        {doc.type === 'document' && doc.file_url && (
                          <button
                            onClick={() => handleViewDocument(doc.file_url)}
                            className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                            title="View Document"
                          >
                            <FaEye />
                          </button>
                        )}
                        {doc.type === 'link' && doc.link_url && (
                          <a
                            href={doc.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 inline-block"
                            title="Open Link"
                          >
                            <FaEye />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(doc)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border p-4 text-center text-gray-500">
                    No documents found. Click &quot;Add Document&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {isEditing ? 'Edit Document' : 'Add New Document'}
              </h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter document title"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g., Forms, Guidelines, References"
                />
              </div>

              {/* Conditional Fields */}
              {formData.type === 'document' ? (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload Document {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  {isEditing && currentDoc?.file_url && (
                    <p className="text-sm text-gray-600 mt-1">
                      Current file: {currentDoc.file_url.split('/').pop()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Website Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="https://example.com"
                    required={formData.type === 'link'}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                >
                  {isEditing ? 'Update' : 'Add'} Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddImpDoc;
