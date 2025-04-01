import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const PrivacyPolicyTable = () => {
    const [policies, setPolicies] = useState([]); // State for all policies
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ file: null });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const apiUrl = "http://65.2.172.92:3000/privacy-policy";

    // Fetch all privacy policies from the API
    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const response = await axios.get(apiUrl);
            console.log("API Response:", response.data);

            // Set the policies state with the fetched data
            if (response.data) {
                setPolicies(response.data);
            } else {
                setPolicies([]);
            }
        } catch (error) {
            console.error("Error fetching privacy policies:", error);
        }
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    // Handle form submission (add or edit policy)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("file", formData.file);

            if (isEditing) {
                // Update existing policy
                await axios.put(`${apiUrl}/${editingId}`, formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                // Add new policy
                await axios.post(apiUrl, formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            setIsModalOpen(false);
            fetchPolicies(); // Refresh the policies
            setFormData({ file: null });
            setIsEditing(false);
            setEditingId(null);
            Swal.fire("Success", "Policy saved successfully!", "success");
        } catch (error) {
            console.error("Error submitting policy:", error);
            Swal.fire("Error", "Failed to save policy", "error");
        }
    };

    // Handle policy deletion
    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Enter Deletion Code",
            text: "Please enter the code to confirm deletion.",
            input: "text",
            inputPlaceholder: "Enter code here...",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
            preConfirm: (inputValue) => {
                if (inputValue !== "0000") {
                    Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
                    return false;
                }
                return true;
            },
        });

        if (confirmDelete.isConfirmed) {
            try {
                await axios.delete(`${apiUrl}/${id}`);
                fetchPolicies(); // Refresh the policies
                Swal.fire("Deleted!", "Policy has been deleted.", "success");
            } catch (error) {
                console.error("Error deleting policy:", error);
                Swal.fire("Error", "Failed to delete policy", "error");
            }
        }
    };

    // Handle editing the policy
    const handleEdit = (policy) => {
        setEditingId(policy.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            {/* Main Container */}
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
                </div>

                {/* Add Button (Disabled if there is at least one policy) */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setIsModalOpen(true);
                        }}
                        className={`bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 ${policies.length > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600"
                            } transition duration-200`}
                        disabled={policies.length > 0} // Disable button if there is at least one policy
                    >
                        <FaPlus /> Add Policy
                    </button>
                </div>

                {/* Table */}
                <div className="p-6 overflow-x-auto">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {["ID", "File URL", "Created At", "Actions"].map((header, index) => (
                                    <th key={index} className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {policies.length > 0 ? (
                                policies.map((policy) => (
                                    <tr key={policy.id} className="bg-[#FFFFFF] hover:bg-orange-100 transition duration-200">
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{policy.id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {policy.policyFileUrl ? (
                                                <a href={policy.policyFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    View File
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">Not Available</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {new Date(policy.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <button
                                                onClick={() => handleEdit(policy)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-3 border border-[#776D6DA8] text-center">
                                        No policies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Policies */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {isEditing ? "Edit Policy" : "Add Policy"}
                        </h2>

                        <input
                            type="file"
                            name="file"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        />

                        <button
                            onClick={handleSubmit}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        >
                            {isEditing ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacyPolicyTable;