import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        role: "Employee",
    });
    const navigate = useNavigate();

    const apiUrl = "https://mazedakhale.in/api/users/employee";

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(apiUrl);
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
            role: "Employee",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: "Processing",
            text: "Please wait...",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const dataToSend = {
            ...formData,
            user_login_status: "InActive",
        };

        try {
            await axios.post("https://mazedakhale.in/api/users/register", dataToSend);
            Swal.fire("Success", "Employee added successfully!", "success");
            fetchEmployees();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire("Error", "Failed to add employee. Please try again.", "error");
        }
    };

    const handleEditEmployee = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password);
    };

    const handleUpdateEmployee = async (id) => {
        try {
            if (updatedPassword) {
                await axios.patch(`https://mazedakhale.in/api/users/password/${id}`, {
                    newPassword: updatedPassword,
                });
            }

            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.user_id === id ? { ...emp, password: updatedPassword } : emp
                )
            );
            setEditingId(null);
            setUpdatedPassword("");

            Swal.fire("Updated", "Password updated successfully!", "success");
        } catch (error) {
            Swal.fire("Error", "Failed to update password.", "error");
        }
    };

    const handleDeleteEmployee = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Enter Deletion Code",
            input: "text",
            inputPlaceholder: "Enter code here...",
            showCancelButton: true,
            confirmButtonText: "Delete",
            preConfirm: (value) => {
                if (value !== "0000") {
                    Swal.showValidationMessage("Incorrect code.");
                }
                return true;
            },
        });

        if (confirmDelete.isConfirmed) {
            try {
                await axios.delete(`https://mazedakhale.in/api/users/delete/${id}`);
                setEmployees((prev) => prev.filter((emp) => emp.user_id !== id));
                Swal.fire("Deleted", "Employee has been deleted.", "success");
            } catch (error) {
                Swal.fire("Error", "Failed to delete employee.", "error");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.user_id === id ? { ...emp, user_login_status: newStatus } : emp
                )
            );

            await axios.patch(`https://mazedakhale.in/api/users/status/${id}`, {
                status: newStatus,
            });

            Swal.fire("Updated", `Status changed to ${newStatus}`, "success");
        } catch (error) {
            fetchEmployees(); // Revert UI if error
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-gray-800">Employee List</h2>
                </div>

                <div className="p-4 flex justify-end">
                    <button
                        onClick={handleAddEmployee}
                        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600"
                    >
                        <FaPlus /> Add Employee
                    </button>
                </div>

                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-sm border border-gray-300 shadow-md bg-white">
                        <thead className="bg-orange-100 border-b-2">
                            <tr>
                                {["ID", "Name", "Email", "Password", "Phone No", "Address", "Status", "Update", "Actions"].map((h, i) => (
                                    <th key={i} className="px-4 py-2 border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr key={emp.user_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                    <td className="px-4 py-2 border text-center">{emp.user_id}</td>
                                    <td className="px-4 py-2 border text-center">{emp.name}</td>
                                    <td className="px-4 py-2 border text-center">{emp.email}</td>


                                    <td className="px-4 py-2 border text-center">
                                        {editingId === emp.user_id ? (
                                            <input
                                                type="text"
                                                value={updatedPassword}
                                                onChange={(e) => setUpdatedPassword(e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : (
                                            emp.password
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border text-center">{emp.phone}</td>
                                    <td className="px-4 py-2 border text-center">{emp.address}</td>
                                    <td className="px-4 py-2 border text-center">{emp.user_login_status}</td>
                                    <td className="px-4 py-2 border text-center">
                                        <button
                                            onClick={() => handleStatusChange(emp.user_id, "Active")}
                                            className={`px-3 py-1 rounded text-white mr-2 ${emp.user_login_status === "Active" ? "bg-green-500" : "bg-gray-500"}`}
                                            disabled={emp.user_login_status === "Active"}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(emp.user_id, "InActive")}
                                            className={`px-3 py-1 rounded text-white ${emp.user_login_status === "InActive" ? "bg-red-500" : "bg-gray-500"}`}
                                            disabled={emp.user_login_status === "InActive"}
                                        >
                                            Inactive
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 border text-center flex gap-2 justify-center">
                                        {editingId === emp.user_id ? (
                                            <button
                                                onClick={() => handleUpdateEmployee(emp.user_id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditEmployee(emp.user_id, emp.password)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteEmployee(emp.user_id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-[400px]">
                            <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Add Employee</h2>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {["name", "email", "password", "phone", "address"].map((field) => (
                                    <input
                                        key={field}
                                        type={field === "password" ? "password" : "text"}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={formData[field]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [field]: e.target.value })
                                        }
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                ))}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 text-white rounded"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
