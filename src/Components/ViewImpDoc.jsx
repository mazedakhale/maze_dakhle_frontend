import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFile, FaLink, FaEye, FaDownload, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config/api";

const ViewImpDoc = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = [...new Set(documents.map(doc => doc.category || 'General'))];
    setCategories(['all', ...uniqueCategories]);
  }, [documents]);

  useEffect(() => {
    // Filter documents by category
    if (selectedCategory === 'all') {
      setFilteredDocs(documents);
    } else {
      setFilteredDocs(documents.filter(doc => (doc.category || 'General') === selectedCategory));
    }
  }, [selectedCategory, documents]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/important-documents/active');
      setDocuments(response.data);
      setFilteredDocs(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      Swal.fire('Error', 'Failed to fetch documents', 'error');
    }
  };

  const handleViewDocument = (url) => {
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
      // Open Google Drive link directly
      window.open(url, '_blank');
    } else {
      // Local file path - append to localhost
      window.open(`${API_BASE_URL}${url}`, '_blank');
    }
  };

  const handleDownloadDocument = async (url, title) => {
    try {
      // Check if it's a Google Drive URL
      if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
        // For Google Drive, open in new tab (user can download from there)
        window.open(url, '_blank');
        Swal.fire('Info', 'Opening Google Drive file. You can download it from there.', 'info');
      } else {
        // Local file - download via axios
        const response = await axios.get(`${API_BASE_URL}${url}`, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Swal.fire('Error', 'Failed to download document', 'error');
    }
  };

  return (
    <>
      <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b]">Important Documents</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-600 transition"
          >
            <FaTimes /> Close
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {doc.type === 'document' ? (
                      <FaFile className="text-blue-500 text-2xl" />
                    ) : (
                      <FaLink className="text-green-500 text-2xl" />
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        doc.type === 'document'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {doc?.type?.charAt(0).toUpperCase() + doc.type.slice(1)}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {doc.category || 'General'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{doc.title}</h3>
                
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                )}

                <div className="flex gap-2">
                  {doc.type === 'document' && doc.file_url && (
                    <>
                      <button
                        onClick={() => handleViewDocument(doc.file_url)}
                        className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-purple-600 transition"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.file_url, doc.title)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                      >
                        <FaDownload /> Download
                      </button>
                    </>
                  )}
                  {doc.type === 'link' && doc.link_url && (
                    <a
                      href={doc.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-green-600 transition"
                    >
                      <FaLink /> Open Link
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No documents available in this category.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewImpDoc;
