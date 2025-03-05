import React, { useEffect, useState } from 'react';

const RecentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortedApplications, setSortedApplications] = useState([]);
    const [sortOrder, setSortOrder] = useState(true); // true for ascending, false for descending

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/documents/recent');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setApplications(data);
                setSortedApplications(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Sort applications based on "Uploaded At"
    const sortApplications = () => {
        const sorted = [...applications].sort((a, b) => {
            const dateA = new Date(a.uploaded_at);
            const dateB = new Date(b.uploaded_at);
            return sortOrder ? dateA - dateB : dateB - dateA;
        });

        setSortedApplications(sorted);
        setSortOrder(!sortOrder); // Toggle the sort order for next click
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="ml-[260px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
            <div className="w-full p-6">
                <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
                    <h3 className="text-green text-lg font-semibold text-center mb-2">
                        View Recent Applications
                    </h3>
                    <div className="overflow-y-auto max-h-[500px] border border-gray-300">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">#</th> {/* Serial number column */}
                                    <th className="px-4 py-2 border">Document ID</th>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Phone</th>
                                    <th className="px-4 py-2 border">Document Fields</th>
                                    <th className="px-4 py-2 border">
                                        <button
                                            onClick={sortApplications}
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                        >
                                            Uploaded At
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 border">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedApplications.length > 0 ? (
                                    sortedApplications.map((app, index) => (
                                        <tr key={app.document_id} className="hover:bg-gray-100">
                                            <td className="px-4 py-2 border">{index + 1}</td> {/* Serial number */}
                                            <td className="px-4 py-2 border">{app.document_id}</td>
                                            <td className="px-4 py-2 border">{app.category_name}</td>
                                            <td className="px-4 py-2 border">{app.name}</td>
                                            <td className="px-4 py-2 border">{app.email}</td>
                                            <td className="px-4 py-2 border">{app.phone}</td>
                                            <td className="px-4 py-2 border">
                                                {app.document_fields ? (
                                                    Object.entries(app.document_fields).map(([key, value], index) => (
                                                        <div key={index}>
                                                            {key}: {value}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>No Fields</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {app.documents && app.documents.length > 0 ? (
                                                    app.documents.map((doc, index) => (
                                                        <div key={index}>
                                                            {doc.file_path ? (
                                                                <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                                                                    View Document {index + 1}
                                                                </a>
                                                            ) : (
                                                                <span>No Document</span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>No Documents</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border">{app.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-2 border text-center">
                                            No recent applications found.
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

export default RecentApplications;
