import React, { useEffect, useState } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import Swal from "sweetalert2";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    distributor_notification: "",
    customer_notification: "",
    notification_date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "https://mazedakhale.in/api/notifications"
      ); // Adjust API URL as needed
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle new notification input change
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({ ...prev, [name]: value }));
  };

  // Add new notification
  const handleAddNotification = async () => {
    try {
      const payload = {
        ...newNotification,
        notification_date:
          newNotification.notification_date || new Date().toISOString(),
      };
      await axios.post("https://mazedakhale.in/api/notifications", payload);
      fetchNotifications();
      setIsModalOpen(false);
      setNewNotification({
        distributor_notification: "",
        customer_notification: "",
        notification_date: "",
      });
    } catch (err) {
      console.error("Error adding notification:", err);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
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
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (confirmDelete.isConfirmed) {
      // **Optimized Approach:**
      // 1. **Remove from UI first** (Makes it feel instant)
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );

      // 2. **API call runs in background, not blocking UI**
      axios
        .delete(`https://mazedakhale.in/api/notifications/${id}`)
        .then(() => {
          fetchNotifications(); // Refresh list after deletion
        })
        .catch((error) => {
          console.error("Error deleting notification:", error);
          Swal.fire("Error", "Failed to delete notification", "error");
        });

      // 3. **Show success message immediately**
      Swal.fire("Deleted!", "Notification has been deleted.", "success");
    }
  };

  // Start editing a notification
  const handleEdit = (id) => {
    setEditingId(id);
    const notification = notifications.find((n) => n.notification_id === id);
    setEditData({
      distributor_notification: notification.distributor_notification,
      customer_notification: notification.customer_notification,
    });
  };

  // Handle edit input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited notification
  const handleSaveEdit = async (id) => {
    try {
      await axios.put(
        `https://mazedakhale.in/api/notifications/${id}`,
        editData
      );
      setEditingId(null);
      fetchNotifications();
    } catch (err) {
      console.error("Error saving edit:", err);
    }
  };

  // Toggle notification status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.patch(
        `https://mazedakhale.in/api/notifications/status/${id}`,
        {
          notification_status: newStatus,
        }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Notifications List
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

        {/* Add Button */}
        <div className="p-4 flex justify-end">
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition duration-200"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Notification
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "ID",
                  "Distributor Notification",
                  "Customer Notification",
                  "Date",
                  "Status",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <tr
                    key={notification.notification_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {notification.notification_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === notification.notification_id ? (
                        <input
                          type="text"
                          name="distributor_notification"
                          value={editData.distributor_notification}
                          onChange={handleEditChange}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : (
                        notification.distributor_notification
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === notification.notification_id ? (
                        <input
                          type="text"
                          name="customer_notification"
                          value={editData.customer_notification}
                          onChange={handleEditChange}
                          className="border border-gray-400 p-2 rounded w-full"
                        />
                      ) : (
                        notification.customer_notification
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {(() => {
                        const date = new Date(notification.notification_date);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        ); // Months are 0-based
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        const seconds = String(date.getSeconds()).padStart(
                          2,
                          "0"
                        );
                        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                      })()}
                    </td>

                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      <button
                        className={`px-3 py-1 rounded text-white ${
                          notification.notification_status === "Active"
                            ? "bg-green-500 cursor-default"
                            : "bg-gray-500 hover:bg-green-600"
                        }`}
                        disabled={notification.notification_status === "Active"}
                        onClick={() =>
                          handleToggleStatus(
                            notification.notification_id,
                            notification.notification_status
                          )
                        }
                      >
                        {notification.notification_status}
                      </button>
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === notification.notification_id ? (
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                          onClick={() =>
                            handleSaveEdit(notification.notification_id)
                          }
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                          onClick={() =>
                            handleEdit(notification.notification_id)
                          }
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() =>
                          handleDelete(notification.notification_id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-semibold mb-4">Add Notification</h3>
            <input
              type="text"
              name="distributor_notification"
              placeholder="Distributor Notification"
              value={newNotification.distributor_notification}
              onChange={handleNewInputChange}
              className="border border-gray-300 p-2 w-full mb-3"
            />
            <input
              type="text"
              name="customer_notification"
              placeholder="Customer Notification"
              value={newNotification.customer_notification}
              onChange={handleNewInputChange}
              className="border border-gray-300 p-2 w-full mb-3"
            />
            <div className="flex justify-end">
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded mr-2 hover:bg-orange-600"
                onClick={handleAddNotification}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
