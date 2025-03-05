import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingApplicationsList = () => {
    const [userId, setUserId] = useState(null);
    const [pendingDocuments, setPendingDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    // Decode user_id from token in localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            setUserId(decodedToken.user_id);
        }
    }, []);

    // Fetch pending documents based on user_id
    useEffect(() => {
        if (!userId) return;

        const fetchPendingDocuments = async () => {
            try {
                const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/pending/${userId}`);
                console.log("Fetched pending documents:", response.data);
                setPendingDocuments(response.data);
            } catch (error) {
                console.error("Error fetching pending documents:", error);
            }
        };

        fetchPendingDocuments();
    }, [userId]);

    // Function to handle search query change
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter pending documents based on search query
    const filteredDocuments = pendingDocuments.filter((document) => {
        return Object.values(document).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="ml-[260px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
            <div className="w-full p-6">
                <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Pending Applications</h2>

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
                                    {/* <th className="px-4 py-2 border">Action</th> */}
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
                                            {/* <td className="px-4 py-2 border">
                                                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                                    View
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-2 border text-center">
                                            No pending applications found.
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

export default PendingApplicationsList;
