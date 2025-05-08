import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { validateRegistration } from "../utils/formValidators.js";
import { useNavigate } from "react-router-dom";

axios.defaults.timeout = 30000;

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
    profilePhoto: null,
    errors: {},
  });

  const navigate = useNavigate();
  const apiUrl = "https://mazedakhale.in/api/users/employee";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(apiUrl);
      setEmployees(res.data);
    } catch (err) {
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
      profilePhoto: null,
      errors: {},
    });
    setIsModalOpen(true);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png"];
    if (file && allowedTypes.includes(file.type)) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
    } else {
      Swal.fire("Invalid File", "Please upload JPG or PNG image.", "warning");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ok, errors } = validateRegistration(formData);
    if (!ok) {
      return Swal.fire("Validation Error", Object.values(errors)[0], "warning");
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    payload.append("phone", formData.phone);
    payload.append("address", formData.address);
    payload.append("role", "Employee");
    payload.append("user_login_status", "InActive");
    if (formData.profilePhoto) {
      payload.append("profilePhoto", formData.profilePhoto);
    }

    Swal.fire({
      title: "Processing",
      text: "Please wait…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.post("https://mazedakhale.in/api/users/register", payload, {

        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Success", "Employee added successfully!", "success");
      fetchEmployees();
      setIsModalOpen(false);
    } catch (err) {
      Swal.fire("Error", "Failed to add employee.", "error");
    }
  };

  const handleEditEmployee = (id, password) => {
    setEditingId(id);
    setUpdatedPassword(password);
  };

  const handleUpdateEmployee = async (id) => {
    try {
      await axios.patch(`https://mazedakhale.in/api/users/password/${id}`, {
        newPassword: updatedPassword,
      });
      setEmployees((prev) =>
        prev.map((e) =>
          e.user_id === id ? { ...e, password: updatedPassword } : e
        )
      );
      setEditingId(null);
      setUpdatedPassword("");
      Swal.fire("Updated", "Password updated successfully!", "success");
    } catch {
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
      await axios.delete(`${apiUrl}/${id}`);
      setEmployees((prev) => prev.filter((e) => e.user_id !== id));
      Swal.fire("Deleted", "Employee has been deleted.", "success");
    } catch {
      Swal.fire("Error", "Failed to delete employee.", "error");
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)]">
      <div className="bg-white shadow-lg border rounded-lg">
        <div className="border-t-4 border-orange-400 bg-gray-100 p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">Employee List</h2>
          <button onClick={() => navigate("/Adashinner")}>
            <FaTimes className="text-gray-600 hover:text-gray-800" />
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

        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-orange-100">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Email",
                  "Password",
                  "Phone",
                  "Address",
                  "Photo",
                  "Status",
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
                <tr key={emp.user_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                  <td className="border px-4 py-2 text-center">
                    {emp.profile_picture ? (
                      <img
                        src={emp.profile_picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border px-4 py-2">{emp.user_login_status}</td>
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

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
              <h3 className="text-lg font-bold mb-4">Add Employee</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {["name", "email", "password", "phone", "address"].map((f) => (
                  <input
                    key={f}
                    type={f === "password" ? "password" : "text"}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    value={formData[f]}
                    onChange={(e) =>
                      setFormData({ ...formData, [f]: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Photo (jpg/png)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />
                </div>

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
