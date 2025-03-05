import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState(""); // State for password editing

    const apiUrl = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/customers";

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
                await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/password/${id}`, { newPassword: updatedPassword });
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
                timer: 1500, // Faster SweetAlert2 success message
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
                await axios.delete(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/delete/${id}`);
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

            await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/status/${id}`, { status: newStatus });

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
        <div className="ml-[330px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
            {/* Customer List Section */}
            <div className="w-full max-w-9xl bg-white p-6 shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Customer List</h2>
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
                            {customers.length > 0 ? (
                                customers.map((customer, index) => (
                                    <tr
                                        key={customer.user_id}
                                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                    >
                                        <td className="p-3 border-r border-gray-400">{customer.user_id}</td>
                                        <td className="p-3 border-r border-gray-400">{customer.name}</td>
                                        <td className="p-3 border-r border-gray-400">{customer.email}</td>
                                        <td className="p-3 border-r border-gray-400">
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
                                        <td className="p-3 border-r border-gray-400">{customer.user_login_status}</td>
                                        <td className="p-3 border-r border-gray-400 text-center">
                                            <button
                                                onClick={() => handleStatusChange(customer.user_id, "Active")}
                                                className="px-3 py-1 rounded bg-green-500 text-white mr-2 hover:bg-green-600"
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(customer.user_id, "Inactive")}
                                                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            {editingId === customer.user_id ? (
                                                <button onClick={() => handleUpdateCustomer(customer.user_id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">
                                                    Save
                                                </button>
                                            ) : (
                                                <button onClick={() => handleEditCustomer(customer.user_id, customer.password)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600">
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteCustomer(customer.user_id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-3 text-center text-gray-500">No customers found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
