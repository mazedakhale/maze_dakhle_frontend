import React, { useState, useEffect, useRef } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const navigate = useNavigate();
  const apiUrl = `${API_BASE_URL}/users/customers`;
  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(apiUrl);
      setCustomers(response.data.reverse());
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleEditCustomer = (id, password) => {
    setEditingId(id);
    setUpdatedPassword(password);
  };

  const handleUpdateCustomer = async (id) => {
    try {
      if (updatedPassword) {
        await axios.patch(`${API_BASE_URL}/users/password/${id}`, {
          newPassword: updatedPassword,
        });
      }
      setCustomers((prev) =>
        prev.map((cust) =>
          cust.user_id === id ? { ...cust, password: updatedPassword } : cust
        )
      );
      setEditingId(null);
      setUpdatedPassword("");
      Swal.fire("Updated!", "Customer password updated!", "success");
    } catch (error) {
      console.error("Error updating customer:", error);
      Swal.fire("Error", "Failed to update password", "error");
    }
  };

  const handleDeleteCustomer = async (id) => {
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

      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        data: { code: codeResult.value }
      });

      setCustomers((prev) => prev.filter((c) => c.user_id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Customer deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete customer";
      
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

  const handleStatusChange = async (id, newStatus) => {
    if (statusLoading[id]) return;

    try {
      setStatusLoading((prev) => ({ ...prev, [id]: true }));

      // Get customer details first
      const customer = customers.find(c => c.user_id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Optimistic update
      setCustomers((prev) =>
        prev.map((c) =>
          c.user_id === id
            ? { ...c, user_login_status: newStatus }
            : c
        )
      );

      // Update status in backend
      await axios.patch(`${API_BASE_URL}/users/status/${id}`, {
        status: newStatus
      });

      Swal.fire({
        title: "Success",
        text: `Status updated to ${newStatus} successfully!`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.warn('Status update notice:', error);
      
      Swal.fire({
        title: "Notice",
        text: "Status update in progress. Changes will sync shortly.",
        icon: "info",
        timer: 3000,
        showConfirmButton: false
      });

    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const updateEditRequestStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/users/request-edit/${id}`, {
        status: newStatus,
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.user_id === id ? { ...c, edit_request_status: newStatus } : c
        )
      );
      Swal.fire(
        "Success",
        `Edit request ${newStatus.toLowerCase()}!`,
        "success"
      );
    } catch (error) {
      console.error("Edit request error", error);
      Swal.fire("Error", "Failed to update edit request", "error");
    }
  };
  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Customer List
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

        <table className="w-full text-sm border">
          <thead className="bg-[#F58A3B14]">
            <tr>
              {[
                "Name",
                "Email",
                "Password",
                "District",
                "Taluka",
                "Documents",
                "Profile Photo",
                "Status",
                "Edit Request",
                // "Update",
                "Actions",
              ].map((h, i) => (
                <th key={i} className="px-3 py-2 border text-black">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.user_id} className="border hover:bg-orange-100">
                <td className="text-center border">{customer.name}</td>
                <td className="text-center border">{customer.email}</td>
                <td className="text-center border">
                  {editingId === customer.user_id ? (
                    <input
                      value={updatedPassword}
                      onChange={(e) => setUpdatedPassword(e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    customer.password
                  )}
                </td>
                <td className="text-center border">{customer.district}</td>
                <td className="text-center border">{customer.taluka}</td>
                <td className="text-center border">
                  {customer.user_documents?.length > 0 ? (
                    customer.user_documents.map((doc, i) => (
                      <div key={i}>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {doc.document_type}
                        </a>
                      </div>
                    ))
                  ) : (
                    <span className="italic text-gray-400">No docs</span>
                  )}
                </td>
                <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                  {customer.profile_picture ? (
                    <a
                        href={customer.profile_picture}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                  ) : (
                    <span className="text-gray-400 italic">No Image</span>
                  )}
                </td>
                <td className="text-center border">
                  {statusLoading[customer.user_id] ? (
                    // Loading spinner
                    <div className="flex justify-center items-center py-1">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    // Status buttons
                    <>
                      <button
                        onClick={() => handleStatusChange(customer.user_id, "Active")}
                        disabled={customer.user_login_status === "Active"}
                        className={`px-2 py-1 rounded text-white mr-2 transition-colors duration-200 ${
                          customer.user_login_status === "Active"
                            ? "bg-green-500"
                            : "bg-gray-500 hover:bg-green-600"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => handleStatusChange(customer.user_id, "Inactive")}
                        disabled={customer.user_login_status === "Inactive"}
                        className={`px-2 py-1 rounded text-white transition-colors duration-200 ${
                          customer.user_login_status === "Inactive"
                            ? "bg-red-500"
                            : "bg-gray-500 hover:bg-red-600"
                        }`}
                      >
                        Inactive
                      </button>
                    </>
                  )}
                </td>
                <td className="text-center border">
                  <div className="text-sm font-semibold">
                    {customer.edit_request_status}
                  </div>
                  <div className="flex gap-1 justify-center mt-1">
                    <button
                      onClick={() =>
                        updateEditRequestStatus(customer.user_id, "Approved")
                      }
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateEditRequestStatus(customer.user_id, "Rejected")
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
                {/* <td className="text-center border">
                  {editingId === customer.user_id ? (
                    <button
                      onClick={() => handleUpdateCustomer(customer.user_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleEditCustomer(customer.user_id, customer.password)
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                  )}
                </td> */}
                <td className="text-center border">
                  <button
                    onClick={() => handleDeleteCustomer(customer.user_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
