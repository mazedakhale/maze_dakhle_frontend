import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingApplicationsList = () => {
    const [userId, setUserId] = useState(null);
    const [pendingDocuments, setPendingDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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
                const response = await axios.get(
                    ` http://mazedakhale.in:3000/userdashboard/pending/${userId}`
                );
                setPendingDocuments(response.data);
            } catch (error) {
                console.error("Error fetching pending documents:", error);
            }
        };

        fetchPendingDocuments();
    }, [userId]);

    // Handle search query
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter documents based on search
    const filteredDocuments = pendingDocuments.filter((document) =>
        Object.values(document).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="w-[calc(100%-260px)] ml-[310px] mt-[80px] p-6">
            {/* Outer Container */}
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Pending Applications</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
                </div>

                {/* Search Bar */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search in table"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
                    />
                </div>

                {/* Table */}
                <div className="p-6 overflow-x-auto">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        {/* Table Header */}
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {["Document ID", "Category", "Subcategory", "Email", "Status", "Uploaded At", "Documents Fields"].map((header, index) => (
                                    <th key={index} className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {filteredDocuments.length > 0 ? (
                                filteredDocuments.map((document, index) => (
                                    <tr key={document.document_id} className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"} hover:bg-orange-100 transition duration-200`}>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{document.document_id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{document.category_name}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{document.subcategory_name}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{document.email}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <span className={`px-3 py-1 rounded-full text-white text-sm ${document.status === "Approved" ? "bg-green-500" : document.status === "Rejected" ? "bg-red-500" : "bg-yellow-500"}`}>
                                                {document.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{new Date(document.uploaded_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {Object.entries(document.document_fields).map(([key, value]) => (
                                                <p key={key}>{key}: {value}</p>
                                            ))}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-3 border border-[#776D6DA8] text-center">
                                        No pending applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

};

export default PendingApplicationsList;
