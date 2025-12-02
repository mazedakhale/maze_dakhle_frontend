// src/pages/PrivacyPolicyTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API_BASE_URL from "../config/api";

const PrivacyPolicyTable = () => {
  const [policies, setPolicies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    file: null,
    policyType: "",
  });

  const apiUrl = `${API_BASE_URL}/privacy-policy`;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data } = await axios.get(apiUrl);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching privacy policies:", err);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleTypeChange = (e) => {
    setFormData({ ...formData, policyType: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      return Swal.fire("Error", "Please select a file.", "error");
    }
    if (!formData.policyType) {
      return Swal.fire("Error", "Please select a policy type.", "error");
    }

    const toSend = new FormData();
    toSend.append("file", formData.file);
    toSend.append("policyType", formData.policyType);

    try {
      if (isEditing) {
        await axios.put(`${apiUrl}/${editingId}`, toSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(apiUrl, toSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeModal();
      fetchPolicies();
      Swal.fire("Success", "Policy saved successfully!", "success");
    } catch (err) {
      console.error("Error submitting policy:", err);
      Swal.fire("Error", "Failed to save policy", "error");
    }
  };

  const handleDelete = async (id) => {
    const codeResult = await Swal.fire({
      title: "Enter Deletion Code",
      text: "Please enter the deletion code to confirm",
      input: "text",
      inputPlaceholder: "Enter deletion code",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Verify & Delete",
      inputValidator: (value) => {
        if (!value) return "Please enter the deletion code";
      },
    });

    if (!codeResult.isConfirmed) return;

    try {
      Swal.fire({
        title: "Verifying...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.delete(`${apiUrl}/${id}`, {
        data: { code: codeResult.value }
      });

      fetchPolicies();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Policy deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting policy:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete policy";
      
      if (errorMessage.includes("Invalid deletion code")) {
        Swal.fire({
          icon: "error",
          title: "Invalid Deletion Code",
          html: `
            <p>${errorMessage}</p>
            <p style="margin-top: 15px;">
              <a href="/AdminDeletionCodeSettings" style="color: #f58a3b; text-decoration: underline;">
                Forgot Code?  Change Code Here
              </a>
            </p>
          `,
          confirmButtonColor: "#f58a3b",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    }
  };

  const handleEdit = (policy) => {
    setEditingId(policy.id);
    setIsEditing(true);
    setFormData({ file: null, policyType: policy.policyType });
    setIsModalOpen(true);
  };

  const openModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ file: null, policyType: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ file: null, policyType: "" });
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Privacy Policy List
          </h2>
          <button
            onClick={() => navigate("/Adashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Add Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={openModal}
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
          >
            <FaPlus /> Add Policy
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["ID", "File URL", "Type", "Created At", "Actions"].map(
                  (header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {policies.length ? (
                policies.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-white hover:bg-orange-100 transition duration-200"
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {p.policyFileUrl ? (
                        <a
                          href={p.policyFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {p.policyType}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {new Date(p.createdAt)
                        .toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                        .replace(",", "")}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No policies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? "Edit Policy" : "Add Policy"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Policy Type */}
              <label className="block mb-2 font-medium">Policy Type:</label>
              <select
                value={formData.policyType}
                onChange={handleTypeChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="">-- Select Type --</option>
                <option value="Terms and Conditions">
                  Terms and Conditions
                </option>
                <option value="Privacy Policy">Privacy Policy</option>
                <option value="Return Policy">
                  Refund and Cancellation Policy
                </option>
              </select>

              {/* File Input */}
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyTable;
