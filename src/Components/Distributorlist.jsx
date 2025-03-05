import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DistributorList = () => {
    const [distributors, setDistributors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState(""); // State for password editing
    const navigate = useNavigate(); // For navigation

    const apiUrl = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/distributors";

    useEffect(() => {
        fetchDistributors();
    }, []);

    const fetchDistributors = async () => {
        try {
            const response = await axios.get(apiUrl);
            setDistributors(response.data);
        } catch (error) {
            console.error("Error fetching distributors:", error);
        }
    };

    const handleEditDistributor = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password); // Set the password for editing
    };

    const handleUpdateDistributor = async (id) => {
        try {
            if (updatedPassword) {
                await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/password/${id}`, { newPassword: updatedPassword });
            }

            setDistributors(
                distributors.map((distributor) =>
                    distributor.user_id === id
                        ? { ...distributor, password: updatedPassword }
                        : distributor
                )
            );

            setEditingId(null);
            setUpdatedPassword("");

            Swal.fire("Updated", "Distributor password updated successfully!", "success");
        } catch (error) {
            console.error("Error updating distributor:", error);
            Swal.fire("Error", "Failed to update distributor password", "error");
        }
    };

    const handleDeleteDistributor = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Enter Deletion Code",
            text: "Please enter the code to confirm deletion.",
            input: "text",
            inputPlaceholder: "Enter code here...",
            inputAttributes: { autocapitalize: "off" },
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
            showLoaderOnConfirm: true,
            preConfirm: (inputValue) => {
                if (inputValue !== "0000") {
                    Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
                    return false;
                }
                return true;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmDelete.isConfirmed) {
            Swal.fire("Deleted!", "Distributor has been deleted.", "success");

            try {
                await axios.delete(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/delete/${id}`);
                setDistributors((prevDistributors) =>
                    prevDistributors.filter((distributor) => distributor.user_id !== id)
                );
            } catch (error) {
                console.error("Error deleting distributor:", error);
                Swal.fire("Error", "Failed to delete distributor", "error");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Update the UI immediately
            setDistributors((prevDistributors) =>
                prevDistributors.map((distributor) =>
                    distributor.user_id === id ? { ...distributor, user_login_status: newStatus } : distributor
                )
            );

            await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/status/${id}`, { status: newStatus });

            Swal.fire("Updated!", `Status changed to ${newStatus}`, "success");
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[330px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
            {/* Distributor List Section */}
            <div className="w-full max-w-9xl bg-white p-6 shadow-lg">
                {/* Header and Add Distributor Button in the Same Row */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Distributor List</h2>
                    <button
                        onClick={() => navigate("/Distributorregister")}
                        className="bg-[#00234E] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-900 transition duration-200"
                    >
                        <FaPlus /> Add Distributor
                    </button>
                </div>

                {/* Scrollable Table Wrapper */}
                <div className="overflow-y-auto max-h-[70vh] border border-gray-300">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-300 text-black sticky top-0">
                            <tr>
                                <th className="p-3 text-left border-r border-gray-400">ID</th>
                                <th className="p-3 text-left border-r border-gray-400">Name</th>
                                <th className="p-3 text-left border-r border-gray-400">Email</th>
                                <th className="p-3 text-left border-r border-gray-400">Password</th>
                                <th className="p-3 text-left border-r border-gray-400">Status</th>
                                <th className="p-3 text-left border-r border-gray-400">Update</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {distributors.length > 0 ? (
                                distributors.map((distributor, index) => (
                                    <tr
                                        key={distributor.user_id}
                                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                    >
                                        <td className="p-3 border-r border-gray-400">{distributor.user_id}</td>
                                        <td className="p-3 border-r border-gray-400">{distributor.name}</td>
                                        <td className="p-3 border-r border-gray-400">{distributor.email}</td>
                                        <td className="p-3 border-r border-gray-400">
                                            {editingId === distributor.user_id ? (
                                                <input
                                                    type="text"
                                                    value={updatedPassword}
                                                    onChange={(e) => setUpdatedPassword(e.target.value)}
                                                    className="border border-gray-400 p-2 rounded w-full"
                                                />
                                            ) : (
                                                distributor.password // Show password directly
                                            )}
                                        </td>
                                        <td className="p-3 border-r border-gray-400">{distributor.user_login_status}</td>
                                        <td className="p-3 border-r border-gray-400 text-center">
                                            <button
                                                onClick={() => handleStatusChange(distributor.user_id, "Active")}
                                                className={`px-3 py-1 rounded text-white mr-2 ${distributor.user_login_status === "Active"
                                                    ? "bg-green-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-green-600"
                                                    }`}
                                                disabled={distributor.user_login_status === "Active"}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(distributor.user_id, "Inactive")}
                                                className={`px-3 py-1 rounded text-white ${distributor.user_login_status === "Inactive"
                                                    ? "bg-red-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-red-600"
                                                    }`}
                                                disabled={distributor.user_login_status === "Inactive"}
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            {editingId === distributor.user_id ? (
                                                <button
                                                    onClick={() => handleUpdateDistributor(distributor.user_id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditDistributor(distributor.user_id, distributor.password)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteDistributor(distributor.user_id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-3 text-center text-gray-500">No distributors found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DistributorList;
