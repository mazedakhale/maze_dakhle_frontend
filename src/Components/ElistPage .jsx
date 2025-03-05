import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaRegFileAlt, FaDownload } from "react-icons/fa";

const ElistPage = () => {
    const { state } = useLocation();
    const { categoryId, categoryName, subcategoryId, subcategoryName } = state || {};
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [statusFilter, setStatusFilter] = useState(""); // State for status filter

    const DOCUMENTS_API_URL = `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/${categoryId}/${subcategoryId}`;

    // Fetch documents based on categoryId and subcategoryId
    useEffect(() => {
        if (categoryId && subcategoryId) {
            const fetchDocuments = async () => {
                try {
                    const response = await axios.get(DOCUMENTS_API_URL);
                    console.log("Fetched documents:", response.data);
                    setDocuments(response.data);
                } catch (error) {
                    console.error("Error fetching documents:", error);
                }
            };
            fetchDocuments();
        }
    }, [categoryId, subcategoryId]);

    // Function to handle search query change
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Function to handle status filter change
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    };

    // Filter documents based on search query and status filter
    const filteredDocuments = documents.filter((document) => {
        const matchesSearchQuery = Object.values(document).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesStatusFilter = statusFilter ? document.status === statusFilter : true;
        return matchesSearchQuery && matchesStatusFilter;
    });

    // Sort documents by the 'uploaded_at' field in descending order
    const sortedDocuments = filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.uploaded_at);
        const dateB = new Date(b.uploaded_at);
        return dateB - dateA; // Sorting in descending order (latest first)
    });

    // Function to handle viewing a document
    const handleViewDocument = (documentId) => {
        // Navigate to the view document page (implement your own navigation logic)
        window.location.href = `/view/${documentId}`;
    };

    // Function to handle downloading a document
    const handleDownloadDocument = async (documentId) => {
        try {
            const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/download/${documentId}`, {
                responseType: "blob", // Important for downloading files
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `document_${documentId}.pdf`); // Change file name as needed
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error downloading document:", error);
            alert("Failed to download document.");
        }
    };

    return (
        <div className="ml-[260px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
            <div className="w-full p-6">
                <div className="w-full max-w-7xl bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        Documents for {categoryName} - {subcategoryName}
                    </h2>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search in table..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="px-4 py-2 border border-gray-300 rounded text-sm w-[200px]"
                        />
                    </div>

                    {/* Status Filter as Radio Buttons */}
                    <div className="mb-4 flex items-center">
                        <span className="mr-2">Filter by Status:</span>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value=""
                                checked={statusFilter === ""}
                                onChange={handleStatusFilter}
                            />
                            All
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="Approved"
                                checked={statusFilter === "Approved"}
                                onChange={handleStatusFilter}
                            />
                            Approved
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="Pending"
                                checked={statusFilter === "Pending"}
                                onChange={handleStatusFilter}
                            />
                            Pending
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="Rejected"
                                checked={statusFilter === "Rejected"}
                                onChange={handleStatusFilter}
                            />
                            Rejected
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto bg-white rounded shadow">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="px-4 py-2 border text-sm">Sr.No</th>
                                    <th className="px-4 py-2 border text-sm">Document ID</th>
                                    <th className="px-4 py-2 border text-sm">Category</th>
                                    <th className="px-4 py-2 border text-sm">Subcategory</th>
                                    <th className="px-4 py-2 border text-sm">Email</th>
                                    <th className="px-4 py-2 border text-sm">Status</th>
                                    <th className="px-4 py-2 border text-sm">Uploaded At</th>
                                    <th className="px-4 py-2 border text-sm">Document Fields</th>
                                    <th className="px-4 py-2 border text-sm">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDocuments.length > 0 ? (
                                    sortedDocuments.map((document, index) => (
                                        <tr key={document.document_id}>
                                            <td className="px-4 py-2 border text-sm">{index + 1}</td> {/* Serial Number */}
                                            <td className="px-4 py-2 border text-sm">{document.document_id}</td>
                                            <td className="px-4 py-2 border text-sm">{document.category_name}</td>
                                            <td className="px-4 py-2 border text-sm">{document.subcategory_name}</td>
                                            <td className="px-4 py-2 border text-sm">{document.email}</td>
                                            <td className="px-4 py-2 border text-sm">{document.status}</td>
                                            <td className="px-4 py-2 border text-sm">{new Date(document.uploaded_at).toLocaleString()}</td>
                                            <td className="px-4 py-2 border text-sm">
                                                {Object.entries(document.document_fields).map(([key, value]) => (
                                                    <p key={key}>{key}: {value}</p>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 border text-sm">
                                                <button
                                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                                    onClick={() => handleViewDocument(document.document_id)}
                                                >
                                                    <FaRegFileAlt className="mr-1" /> View
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-2 border text-sm text-center">
                                            No documents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElistPage;