import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState(""); // State for password editing

    const apiUrl = "http://mazedakhale.in:3000/users/customers";

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(apiUrl);
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const handleEditCustomer = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password); // Set the password for editing
    };

    const handleUpdateCustomer = async (id) => {
        try {
            if (updatedPassword) {
                await axios.patch(`http://mazedakhale.in:3000/users/password/${id}`, { newPassword: updatedPassword });
            }

            setCustomers(
                customers.map((customer) =>
                    customer.user_id === id
                        ? { ...customer, password: updatedPassword }
                        : customer
                )
            );

            setEditingId(null);
            setUpdatedPassword("");

            Swal.fire({
                title: "Updated",
                text: "Customer password updated successfully!",
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating customer:", error);
            Swal.fire("Error", "Failed to update customer password", "error");
        }
    };

    const handleDeleteCustomer = async (id) => {
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
                title: "Deleted!",
                text: "Customer has been deleted.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            try {
                await axios.delete(`http://mazedakhale.in:3000/users/delete/${id}`);
                setCustomers((prevCustomers) =>
                    prevCustomers.filter((customer) => customer.user_id !== id)
                );
            } catch (error) {
                console.error("Error deleting customer:", error);
                Swal.fire("Error", "Failed to delete customer", "error");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Update the UI immediately
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    customer.user_id === id ? { ...customer, user_login_status: newStatus } : customer
                )
            );

            await axios.patch(`http://mazedakhale.in:3000/users/status/${id}`, { status: newStatus });

            Swal.fire({
                title: "Updated!",
                text: `Status changed to ${newStatus}`,
                icon: "success",
                timer: 1000, // Faster SweetAlert2 update
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
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
                            {customers.length > 0 ? (
                                customers.map((customer, index) => (
                                    <tr
                                        key={customer.user_id}
                                        className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"} hover:bg-orange-100 transition duration-200`}
                                    >
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{customer.user_id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{customer.name}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{customer.email}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === customer.user_id ? (
                                                <input
                                                    type="text"
                                                    value={updatedPassword}
                                                    onChange={(e) => setUpdatedPassword(e.target.value)}
                                                    className="border border-gray-400 p-2 rounded w-full"
                                                />
                                            ) : (
                                                customer.password
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{customer.user_login_status}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <button
                                                onClick={() => handleStatusChange(customer.user_id, "Active")}
                                                className={`px-3 py-1 rounded text-white mr-2 ${customer.user_login_status === "Active"
                                                    ? "bg-green-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-green-600"
                                                    }`}
                                                disabled={customer.user_login_status === "Active"}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(customer.user_id, "Inactive")}
                                                className={`px-3 py-1 rounded text-white ${customer.user_login_status === "Inactive"
                                                    ? "bg-red-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-red-600"
                                                    }`}
                                                disabled={customer.user_login_status === "Inactive"}
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === customer.user_id ? (
                                                <button
                                                    onClick={() => handleUpdateCustomer(customer.user_id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditCustomer(customer.user_id, customer.password)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.user_id)}
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
                                        No customers found.
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

export default CustomerList;
