import React, { useState, useEffect } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const apiUrl = "https://maze-backend-production.up.railway.app/users/customers";
=======
  const apiUrl = "http://maze-backend-production.up.railway.app/users/customers";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
        await axios.patch(`https://maze-backend-production.up.railway.app/users/password/${id}`, {
=======
        await axios.patch(`http://maze-backend-production.up.railway.app/users/password/${id}`, {
>>>>>>> Stashed changes
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
    const confirm = await Swal.fire({
      title: "Enter Deletion Code",
      input: "text",
      inputPlaceholder: "0000",
      showCancelButton: true,
      preConfirm: (val) =>
        val === "0000" || Swal.showValidationMessage("Wrong code"),
    });

    if (confirm.isConfirmed) {
      try {
<<<<<<< Updated upstream
        await axios.delete(`https://maze-backend-production.up.railway.app/users/delete/${id}`);
=======
        await axios.delete(`http://maze-backend-production.up.railway.app/users/delete/${id}`);
>>>>>>> Stashed changes
        setCustomers((prev) => prev.filter((c) => c.user_id !== id));
        Swal.fire("Deleted!", "Customer removed.", "success");
      } catch (error) {
        console.error("Delete failed", error);
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const customer = customers.find((c) => c.user_id === id);
      if (!customer) throw new Error("Customer not found");

      // Step 1: Update backend status
<<<<<<< Updated upstream
      await axios.patch(`https://maze-backend-production.up.railway.app/users/status/${id}`, {
=======
      await axios.patch(`http://maze-backend-production.up.railway.app/users/status/${id}`, {
>>>>>>> Stashed changes
        status: newStatus,
      });

      // Step 2: Update local state
      setCustomers((prev) =>
        prev.map((c) =>
          c.user_id === id ? { ...c, user_login_status: newStatus } : c
        )
      );

      // Step 3: Prepare SMS
      const rawPhone = customer.phone?.replace(/^0+/, "") || "";
      const phoneE164 = rawPhone.startsWith("91") ? rawPhone : "91" + rawPhone;

<<<<<<< Updated upstream
      const SMS_URL = "https://maze-backend-production.up.railway.app/sms/send";
=======
      const SMS_URL = "http://maze-backend-production.up.railway.app/sms/send";
>>>>>>> Stashed changes
      const SMS_SENDER = "918308178738";

      const message =
        newStatus === "Active"
          ? `Hello ${customer.name}, your login status has been updated to *Active*. You're free to login the website.`
          : `Hello ${customer.name}, your login status has been updated to *Inactive*. Contact Admin for more details or questions.`;

      // Step 4: Send SMS
      await fetch(SMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: SMS_SENDER,
          number: phoneE164,
          message,
        }),
      });

      Swal.fire("Success", `Status set to ${newStatus}`, "success");
    } catch (error) {
      console.error("Status update error", error);
      Swal.fire("Error", "Could not change status", "error");
    }
  };

  const updateEditRequestStatus = async (id, newStatus) => {
    try {
<<<<<<< Updated upstream
      await axios.patch(`https://maze-backend-production.up.railway.app/users/request-edit/${id}`, {
=======
      await axios.patch(`http://maze-backend-production.up.railway.app/users/request-edit/${id}`, {
>>>>>>> Stashed changes
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
                "Update",
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
                    <img
                      src={customer.profile_picture}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No Image</span>
                  )}
                </td>
                <td className="text-center border">
                  <button
                    onClick={() =>
                      handleStatusChange(customer.user_id, "Active")
                    }
                    className={`px-2 py-1 rounded text-white mr-2 ${
                      customer.user_login_status === "Active"
                        ? "bg-green-500"
                        : "bg-gray-500 hover:bg-green-600"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(customer.user_id, "Inactive")
                    }
                    className={`px-2 py-1 rounded text-white ${
                      customer.user_login_status === "Inactive"
                        ? "bg-red-500"
                        : "bg-gray-500 hover:bg-red-600"
                    }`}
                  >
                    Inactive
                  </button>
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
                <td className="text-center border">
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
                </td>
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
