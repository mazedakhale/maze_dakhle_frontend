// EmployeeList.jsx

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { validateRegistration } from "../utils/formValidators.js";

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

    const apiUrl = "https://mazedakhale.in/api/users/register";

    // fetch list on mount
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1) client‑side duplicate‑email check
        if (employees.some((emp) => emp.email === formData.email)) {
            return Swal.fire("Oops", "That email is already registered", "warning");
        }

        // 2) client‑side validation
        const { ok, errors } = validateRegistration(formData);
        if (!ok) {
            const firstErr = Object.values(errors)[0];
            return Swal.fire("Validation Error", firstErr, "warning");
        }

        // 3) show spinner
        Swal.fire({
            title: "Processing",
            text: "Please wait…",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const payload = { ...formData, user_login_status: "InActive" };

        try {
            // use JSON‑only endpoint
            await axios.post(apiUrl, payload);

            Swal.fire("Success", "Employee added successfully!", "success");
            fetchEmployees();
            setIsModalOpen(false);
        } catch (error) {
            Swal.close();

            if (error.response?.status === 409) {
                const msg =
                    error.response.data?.message || "That email is already registered.";
                return Swal.fire("Oops", msg, "warning");
            }

            Swal.fire("Error", "Failed to add employee. Please try again.", "error");
        }
    };

    const handleEditEmployee = (id, password) => {
        setEditingId(id);
        setUpdatedPassword(password);
    };

    const handleUpdateEmployee = async (id) => {
        if (!updatedPassword) return;
        try {
            await axios.patch(
                `https://mazedakhale.in/api/users/password/${id}`,
                { newPassword: updatedPassword }
            );
            setEmployees((prev) =>
                prev.map((e) =>
                    e.user_id === id ? { ...e, password: updatedPassword } : e
                )
            );
            setEditingId(null);
            setUpdatedPassword("");
            Swal.fire("Updated", "Password updated successfully!", "success");
        } catch (err) {
            Swal.fire("Error", "Failed to update password.", "error");
        }
    };

    const handleDeleteEmployee = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Enter Deletion Code",
            input: "text",
            inputPlaceholder: "Enter code here…",
            showCancelButton: true,
            confirmButtonText: "Delete",
            preConfirm: (v) => {
                if (v !== "0000") Swal.showValidationMessage("Incorrect code");
                return v;
            },
        });
        if (!isConfirmed) return;

        try {
            await axios.delete(`https://mazedakhale.in/api/users/delete/${id}`);
            setEmployees((prev) => prev.filter((e) => e.user_id !== id));
            Swal.fire("Deleted", "Employee has been deleted.", "success");
        } catch {
            Swal.fire("Error", "Failed to delete employee.", "error");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setEmployees((prev) =>
                prev.map((e) =>
                    e.user_id === id
                        ? { ...e, user_login_status: newStatus }
                        : e
                )
            );
            await axios.patch(`https://mazedakhale.in/api/users/status/${id}`, {
                status: newStatus,
            });
            Swal.fire("Updated", `Status changed to ${newStatus}`, "success");
        } catch {
            fetchEmployees(); // rollback
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
            <div className="bg-white shadow rounded border overflow-hidden">
                <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Employee List</h2>
                    <button
                        onClick={handleAddEmployee}
                        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600"
                    >
                        <FaPlus /> Add Employee
                    </button>
                </div>

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
                                    "Actions",
                                ].map((h) => (
                                    <th key={h} className="px-4 py-2 border">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr
                                    key={emp.user_id}
                                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                    <td className="border px-4 py-2">{emp.user_id}</td>
                                    <td className="border px-4 py-2">{emp.name}</td>
                                    <td className="border px-4 py-2">{emp.email}</td>
                                    <td className="border px-4 py-2">
                                        {editingId === emp.user_id ? (
                                            <input
                                                value={updatedPassword}
                                                onChange={(e) => setUpdatedPassword(e.target.value)}
                                                className="border p-1 w-full"
                                            />
                                        ) : (
                                            emp.password
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">{emp.phone}</td>
                                    <td className="border px-4 py-2">{emp.address}</td>
                                    <td className="border px-4 py-2">
                                        {emp.user_login_status}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() =>
                                                handleStatusChange(emp.user_id, "Active")
                                            }
                                            className={`px-2 py-1 mr-2 rounded text-white ${emp.user_login_status === "Active"
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`}
                                            disabled={emp.user_login_status === "Active"}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleStatusChange(emp.user_id, "InActive")
                                            }
                                            className={`px-2 py-1 rounded text-white ${emp.user_login_status === "InActive"
                                                ? "bg-red-500"
                                                : "bg-gray-400"
                                                }`}
                                            disabled={emp.user_login_status === "InActive"}
                                        >
                                            Inactive
                                        </button>
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
                                                onClick={() =>
                                                    handleEditEmployee(emp.user_id, emp.password)
                                                }
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

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow w-[400px]">
                            <h3 className="text-lg font-bold mb-4">Add Employee</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {["name", "email", "password", "phone", "address"].map((f) => (
                                    <input
                                        key={f}
                                        type={
                                            f === "password"
                                                ? "password"
                                                : f === "email"
                                                    ? "email"
                                                    : "text"
                                        }
                                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                        value={formData[f]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [f]: e.target.value })
                                        }
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
        </div>
    );
};

export default EmployeeList;
