import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";

const ClistPage = () => {
    const { state } = useLocation();
    const { categoryId, subcategoryId } = state || {};
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [userId, setUserId] = useState(null);

    // Extract user ID from token
    useEffect(() => {
        const getUserId = () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    return decodedToken.user_id; // Adjust according to your backend token structure
                } catch (error) {
                    console.error("Error decoding token:", error);
                    return null;
                }
            }
            return null;
        };

        const id = getUserId();
        console.log("Extracted User ID:", id); // Debugging
        setUserId(id);
    }, []);

    // Fetch documents based on categoryId, subcategoryId, and userId
    useEffect(() => {
        if (categoryId && subcategoryId && userId) {
            const DOCUMENTS_API_URL = `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/doc/${categoryId}/${subcategoryId}/${userId}`;
            console.log("API URL:", DOCUMENTS_API_URL); // Debugging

            const fetchDocuments = async () => {
                try {
                    const response = await axios.get(DOCUMENTS_API_URL);
                    console.log("Fetched documents:", response.data); // Debugging
                    setDocuments(response.data);
                } catch (error) {
                    console.error("Error fetching documents:", error);
                }
            };
            fetchDocuments();
        }
    }, [categoryId, subcategoryId, userId]); // Depend on userId

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredDocuments = documents.filter((document) =>
        Object.values(document).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="ml-[330px] flex flex-col items-center min-h-screen p-5 bg-gray-100">
            <div className="w-full p-6">
                <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        Documents for Category ID: {categoryId} - Subcategory ID: {subcategoryId}
                    </h2>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search in table..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="px-4 py-2 border border-gray-300 rounded"
                        />
                    </div>

                    {/* Document Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto bg-white rounded shadow">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Document ID</th>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Subcategory</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Uploaded At</th>
                                    <th className="px-4 py-2 border">Document Fields</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocuments.length > 0 ? (
                                    filteredDocuments.map((document) => (
                                        <tr key={document.document_id}>
                                            <td className="px-4 py-2 border">{document.document_id}</td>
                                            <td className="px-4 py-2 border">{document.category_name}</td>
                                            <td className="px-4 py-2 border">{document.subcategory_name}</td>
                                            <td className="px-4 py-2 border">{document.email}</td>
                                            <td className="px-4 py-2 border">{document.status}</td>
                                            <td className="px-4 py-2 border">{new Date(document.uploaded_at).toLocaleString()}</td>
                                            <td className="px-4 py-2 border">
                                                {Object.entries(document.document_fields).map(([key, value]) => (
                                                    <p key={key}>{key}: {value}</p>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-2 border text-center">
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

export default ClistPage;
