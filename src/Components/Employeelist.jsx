import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { validateRegistration } from "../utils/formValidators.js";
import { useNavigate } from "react-router-dom";

axios.defaults.timeout = 30000; // 30 seconds

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [isAdding, setIsAdding] = useState(false);

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
            const resp = await axios.get(apiUrl);
            setEmployees(resp.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
            Swal.fire("Error", "Failed to fetch employees.", "error");
        }
    };

    const handleAddEmployee = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            role: "Employee",
        });
        setIsModalOpen(true);
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (employees.some(emp => emp.email === formData.email)) {
            return Swal.fire("Oops", "That email is already registered", "warning");
        }

        const { ok, errors } = validateRegistration(formData);
        if (!ok) {
            return Swal.fire("Validation Error", Object.values(errors)[0], "warning");
        }

        Swal.fire({
            title: "Processing",
            text: "Please wait…",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const payload = { ...formData, user_login_status: "InActive" };

        try {
            await axios.post(apiUrl, payload);
            Swal.fire("Success", "Employee added successfully!", "success");
            fetchEmployees();
            setIsModalOpen(false);
        } catch (error) {
            Swal.close();
            if (error.response?.status === 409) {
                return Swal.fire("Oops", error.response.data?.message || "That email is already registered.", "warning");
            }
            Swal.fire("Error", "Failed to add employee. Please try again.", "error");
        }
    };

    const handleEditEmployee = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password);
    };

    const handleUpdateEmployee = async id => {
        if (!updatedPassword) return;
        try {
            await axios.patch(`https://mazedakhale.in/api/users/password/${id}`, { newPassword: updatedPassword });
            setEmployees(prev =>
                prev.map(e => (e.user_id === id ? { ...e, password: updatedPassword } : e))
            );
            setEditingId(null);
            setUpdatedPassword("");
            Swal.fire("Updated", "Password updated successfully!", "success");
        } catch {
            Swal.fire("Error", "Failed to update password.", "error");
        }
    };

    const handleDeleteEmployee = async id => {
        const { isConfirmed } = await Swal.fire({
            title: "Enter Deletion Code",
            input: "text",
            inputPlaceholder: "Enter code here…",
            showCancelButton: true,
            confirmButtonText: "Delete",
            preConfirm: v => {
                if (v !== "0000") Swal.showValidationMessage("Incorrect code");
                return v;
            },
        });
        if (!isConfirmed) return;

        try {
            await axios.delete(`${apiUrl}/${id}`);
            setEmployees(prev => prev.filter(e => e.user_id !== id));
            Swal.fire("Deleted", "Employee has been deleted.", "success");
        } catch {
            Swal.fire("Error", "Failed to delete employee.", "error");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setEmployees(prev =>
                prev.map(e => (e.user_id === id ? { ...e, user_login_status: newStatus } : e))
            );
            await axios.patch(`https://mazedakhale.in/api/users/status/${id}`, { status: newStatus });
            Swal.fire("Updated", `Status changed to ${newStatus}`, "success");
        } catch {
            fetchEmployees();
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    const updateEditRequestStatus = async (id, newStatus) => {
        try {
            await axios.patch(`https://mazedakhale.in/api/users/request-edit/${id}`, { status: newStatus });
            setEmployees(prev =>
                prev.map(d => (d.user_id === id ? { ...d, edit_request_status: newStatus } : d))
            );
            Swal.fire("Success", `Edit request ${newStatus.toLowerCase()}!`, "success");
        } catch {
            Swal.fire("Error", "Failed to update edit request", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">

            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">
                        Employee List
                    </h2>
                    <button
                        onClick={() => {
                            setIsAdding(false);
                            navigate("/Adashinner");
                        }}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-4 flex justify-end">


                    <button
                        onClick={handleAddEmployee}
                        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600"
                    >
                        <FaPlus /> Add Employee
                    </button>

                </div>
                {/* TABLE */}
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm border border-gray-300 bg-white">
                        <thead className="bg-orange-100">
                            <tr>
                                {[
                                    "ID",
                                    "Name",
                                    "Email",
                                    "Password",
                                    "Phone",
                                    "Address",
                                    "Status",
                                    "Update",
                                    "Request",
                                    "Actions",
                                ].map(h => (
                                    <th key={h} className="px-4 py-2 border">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr key={emp.user_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border px-4 py-2">{emp.user_id}</td>
                                    <td className="border px-4 py-2">{emp.name}</td>
                                    <td className="border px-4 py-2">{emp.email}</td>
                                    <td className="border px-4 py-2">
                                        {editingId === emp.user_id ? (
                                            <input
                                                value={updatedPassword}
                                                onChange={e => setUpdatedPassword(e.target.value)}
                                                className="border p-1 w-full"
                                            />
                                        ) : (
                                            emp.password
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">{emp.phone}</td>
                                    <td className="border px-4 py-2">{emp.address}</td>
                                    <td className="border px-4 py-2">{emp.user_login_status}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => handleStatusChange(emp.user_id, "Active")}
                                            className={`px-2 py-1 mr-2 rounded text-white ${emp.user_login_status === "Active" ? "bg-green-500" : "bg-gray-400"
                                                }`}
                                            disabled={emp.user_login_status === "Active"}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(emp.user_id, "InActive")}
                                            className={`px-2 py-1 rounded text-white ${emp.user_login_status === "InActive" ? "bg-red-500" : "bg-gray-400"
                                                }`}
                                            disabled={emp.user_login_status === "InActive"}
                                        >
                                            Inactive
                                        </button>
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="text-sm font-semibold">{emp.edit_request_status}</div>
                                        <div className="flex gap-1 justify-center mt-1">
                                            <button
                                                onClick={() => updateEditRequestStatus(emp.user_id, "Approved")}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateEditRequestStatus(emp.user_id, "Rejected")}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                    <td className="border px-4 py-2 flex justify-center gap-2">
                                        {editingId === emp.user_id ? (
                                            <button
                                                onClick={() => handleUpdateEmployee(emp.user_id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditEmployee(emp.user_id, emp.password)}
                                                className="text-blue-500"
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteEmployee(emp.user_id)}
                                            className="text-red-500"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                            <h3 className="text-lg font-bold mb-4">
                                Add Employee
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {["name", "email", "password", "phone", "address"].map(f => (
                                    <input
                                        key={f}
                                        type={f === "password" ? "password" : f === "email" ? "email" : "text"}
                                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                        value={formData[f]}
                                        onChange={e => setFormData({ ...formData, [f]: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                ))}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-400 text-white rounded"
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
        </div >
    );
};

export default EmployeeList;
