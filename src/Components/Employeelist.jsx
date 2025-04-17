import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Set default timeout for all axios requests
axios.defaults.timeout = 30000; // 30 seconds

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "Employee", // Hardcode role as "employee"
    });
    const navigate = useNavigate();

    // API endpoint for fetching employees
    const apiUrl = "https://mazedakhale.in/api/users/employee";

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(apiUrl, { timeout: 30000 });
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire("Error", "Failed to fetch employees. Server might be down.", "error");
        }
    };

    const handleAddEmployee = () => {
        setIsModalOpen(true);
        setFormData({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            role: "employee",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        // Prepare data to send to the backend
        const dataToSend = {
            ...formData,
            user_login_status: "InActive", // Set login status as "InActive"
        };

        try {
            // Send the registration request to the backend
            const response = await axios.post("https://mazedakhale.in/api/users/register", dataToSend, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 30000, // Increase timeout to 30 seconds
            });

            console.log("API Response:", response.data); // Log the response

            // Close the "Processing" alert and show success message
            Swal.fire({
                title: "Success",
                text: "Employee added successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                fetchEmployees(); // Refresh the list
                setIsModalOpen(false); // Close the modal
            });
        } catch (error) {
            console.error("Error adding employee:", error);

            // Close the "Processing" alert and show error message
            Swal.fire({
                title: "Error",
                text: "Failed to add employee. Please try again.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleEditEmployee = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password);
    };

    const handleUpdateEmployee = async (id) => {
        try {
            if (updatedPassword) {
                await axios.patch(`https://mazedakhale.in/api/users/password/${id}`,
                    { newPassword: updatedPassword },
                    { timeout: 30000 }
                );
            }

            setEmployees(
                employees.map((employee) =>
                    employee.user_id === id
                        ? { ...employee, password: updatedPassword }
                        : employee
                )
            );

            setEditingId(null);
            setUpdatedPassword("");

            Swal.fire({
                title: "Updated",
                text: "Employee password updated successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating employee:", error);
            Swal.fire("Error", "Failed to update employee password", "error");
        }
    };

    const handleDeleteEmployee = async (id) => {
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
                await axios.delete(`https://mazedakhale.in/api/users/delete/${id}`, { timeout: 30000 });

                Swal.fire({
                    title: "Deleted!",
                    text: "Employee has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

                setEmployees((prevEmployees) =>
                    prevEmployees.filter((employee) => employee.user_id !== id)
                );
            } catch (error) {
                console.error("Error deleting employee:", error);
                Swal.fire("Error", "Failed to delete employee", "error");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Update the UI immediately
            setEmployees((prevEmployees) =>
                prevEmployees.map((employee) =>
                    employee.user_id === id ? { ...employee, user_login_status: newStatus } : employee
                )
            );

            await axios.patch(`https://mazedakhale.in/api/users/status/${id}`,
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
            fetchEmployees();

            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Employee List</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
                </div>

                {/* Add Button */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={handleAddEmployee}
                        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
                    >
                        <FaPlus /> Add Employee
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
                            {employees.length > 0 ? (
                                employees.map((employee, index) => (
                                    <tr
                                        key={employee.user_id}
                                        className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"} hover:bg-orange-100 transition duration-200`}
                                    >
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{employee.user_id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{employee.name}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{employee.email}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === employee.user_id ? (
                                                <input
                                                    type="text"
                                                    value={updatedPassword}
                                                    onChange={(e) => setUpdatedPassword(e.target.value)}
                                                    className="border border-gray-400 p-2 rounded w-full"
                                                />
                                            ) : (
                                                employee.password
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{employee.user_login_status}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <button
                                                onClick={() => handleStatusChange(employee.user_id, "Active")}
                                                className={`px-3 py-1 rounded text-white mr-2 ${employee.user_login_status === "Active"
                                                    ? "bg-green-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-green-600"
                                                    }`}
                                                disabled={employee.user_login_status === "Active"}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(employee.user_id, "InActive")}
                                                className={`px-3 py-1 rounded text-white ${employee.user_login_status === "InActive"
                                                    ? "bg-red-500 cursor-default"
                                                    : "bg-gray-500 hover:bg-red-600"
                                                    }`}
                                                disabled={employee.user_login_status === "InActive"}
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {editingId === employee.user_id ? (
                                                <button
                                                    onClick={() => handleUpdateEmployee(employee.user_id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditEmployee(employee.user_id, employee.password)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.user_id)}
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
                                        No employees found.
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
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Employee</h2>

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
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;