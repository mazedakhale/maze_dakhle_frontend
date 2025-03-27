import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Set default timeout for all axios requests
axios.defaults.timeout = 30000; // 30 seconds

const DistributorList = () => {
    const [distributors, setDistributors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        shopAddress: "",
        aadharCard: null,
        panCard: null,
        errors: { aadharCard: "", panCard: "" },
    });
    const navigate = useNavigate();

    const apiUrl = "http://localhost:3000/users/distributors";

    useEffect(() => {
        fetchDistributors();
    }, []);

    const fetchDistributors = async () => {
        try {
            const response = await axios.get(apiUrl, { timeout: 30000 });
            setDistributors(response.data);
        } catch (error) {
            console.error("Error fetching distributors:", error);
            Swal.fire("Error", "Failed to fetch distributors. Server might be down.", "error");
        }
    };

    const handleAddDistributor = () => {
        setIsModalOpen(true);
        setFormData({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            shopAddress: "",
            aadharCard: null,
            panCard: null,
            errors: { aadharCard: "", panCard: "" },
        });
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
            const maxSize = 500 * 1024; // 500KB

            if (!allowedTypes.includes(file.type)) {
                setFormData((prev) => ({
                    ...prev,
                    errors: { ...prev.errors, [field]: "File type not supported. Please upload a PDF, JPG, or PNG file." },
                }));
                return;
            }

            if (file.size > maxSize) {
                setFormData((prev) => ({
                    ...prev,
                    errors: { ...prev.errors, [field]: "File size exceeds 500KB. Please upload a smaller file." },
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                [field]: file,
                errors: { ...prev.errors, [field]: "" },
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that both Aadhar Card and PAN Card are uploaded
        if (!formData.aadharCard || !formData.panCard) {
            Swal.fire({
                title: "Error",
                text: "Please upload both Aadhar Card and PAN Card.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
            return;
        }

        // Show "Processing, please wait" alert
        Swal.fire({
            title: "Processing",
            text: "Please wait while your request is being processed...",
            icon: "info",
            allowOutsideClick: false, // Prevent closing by clicking outside
            didOpen: () => {
                Swal.showLoading(); // Show loading spinner
            },
        });

        // Create FormData object to send to the backend
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("shopAddress", formData.shopAddress || ""); // Optional field
        formDataToSend.append("role", "Distributor"); // Hardcode role as "Distributor"
        formDataToSend.append("user_login_status", "Active"); // Set login status as "Active"

        // Append files and document types
        formDataToSend.append("files", formData.aadharCard);
        formDataToSend.append("files", formData.panCard);
        formDataToSend.append("documentTypes", "Aadhar Card");
        formDataToSend.append("documentTypes", "PAN Card");

        try {
            // Send the registration request to the backend
            const response = await axios.post("http://localhost:3000/users/register", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000, // Increase timeout to 30 seconds
            });

            console.log("API Response:", response.data); // Log the response

            // Close the "Processing" alert and show success message
            Swal.fire({
                title: "Success",
                text: "Distributor added successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                fetchDistributors(); // Refresh the list
                setIsModalOpen(false); // Close the modal
            });
        } catch (error) {
            console.error("Error adding distributor:", error);

            // Close the "Processing" alert and show error message
            Swal.fire({
                title: "Error",
                text: "Failed to add distributor. Please try again.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleEditDistributor = (distributor) => {
        setEditingId(distributor.user_id);
        setUpdatedPassword(distributor.password);
    };

    const handleUpdateDistributor = async (id) => {
        try {
            if (updatedPassword) {
                await axios.patch(`http://localhost:3000/users/password/${id}`,
                    { newPassword: updatedPassword },
                    { timeout: 30000 }
                );
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

            Swal.fire({
                title: "Updated",
                text: "Distributor password updated successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
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
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while we process your request",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await axios.delete(`http://localhost:3000/users/delete/${id}`, { timeout: 30000 });

                Swal.fire({
                    title: "Deleted!",
                    text: "Distributor has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

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

            await axios.patch(`http://localhost:3000/users/status/${id}`,
                { status: newStatus },
                { timeout: 30000 }
            );

            Swal.fire({
                title: "Updated!",
                text: `Status changed to ${newStatus}`,
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating status:", error);

            // Revert UI change if API call fails
            fetchDistributors();

            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Distributor List</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
                </div>

                {/* Add Button */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={handleAddDistributor}
                        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
                    >
                        <FaPlus /> Add Distributor
                    </button>
                </div>

                {/* Table */}
                <div className="p-6 overflow-x-auto">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {["ID", "Name", "Email", "Password", "Status", "Update", "Actions"].map((header, index) => (
                                    <th key={index} className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {distributors.length > 0 ? (
                                distributors.map((distributor, index) => (
                                    <tr
                                        key={distributor.user_id}
                                        className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"} hover:bg-orange-100 transition duration-200`}
                                    >
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{distributor.user_id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{distributor.name}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{distributor.email}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === distributor.user_id ? (
                                                <input
                                                    type="text"
                                                    value={updatedPassword}
                                                    onChange={(e) => setUpdatedPassword(e.target.value)}
                                                    className="border border-gray-400 p-2 rounded w-full"
                                                />
                                            ) : (
                                                distributor.password
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{distributor.user_login_status}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
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
                                                onClick={() => handleStatusChange(distributor.user_id, "InActive")}
                                                className={`px-3 py-1 rounded text-white ${distributor.user_login_status === "InActive"
                                                    ? "bg-red-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-red-600"
                                                    }`}
                                                disabled={distributor.user_login_status === "InActive"}
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === distributor.user_id ? (
                                                <button
                                                    onClick={() => handleUpdateDistributor(distributor.user_id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditDistributor(distributor)}
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
                                    <td colSpan="7" className="px-4 py-3 border border-[#776D6DA8] text-center">
                                        No distributors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Distributor</h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                                required
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                                required
                            />
                            <input
                                type="text"
                                name="shopAddress"
                                placeholder="Shop Address (Optional)"
                                value={formData.shopAddress}
                                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                                className="w-full p-2 border rounded text-xs"
                            />

                            {/* Aadhar Card Upload */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Aadhar Card (Max: 500KB)</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e, "aadharCard")}
                                    className="w-full text-xs"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {formData.errors.aadharCard && (
                                    <p className="text-red-500 text-xs mt-1">{formData.errors.aadharCard}</p>
                                )}
                            </div>

                            {/* PAN Card Upload */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card (Max: 500KB)</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e, "panCard")}
                                    className="w-full text-xs"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {formData.errors.panCard && (
                                    <p className="text-red-500 text-xs mt-1">{formData.errors.panCard}</p>
                                )}
                            </div>

                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600"
                                >
                                    Add Distributor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributorList;