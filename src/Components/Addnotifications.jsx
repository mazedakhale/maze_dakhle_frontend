import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    distributor_notification: '',
    customer_notification: '',
    notification_date: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications'); // Adjust API URL as needed
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
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
        notification_date: newNotification.notification_date || new Date().toISOString(),
      };
      await axios.post('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications', payload);
      fetchNotifications();
      setIsModalOpen(false);
      setNewNotification({ distributor_notification: '', customer_notification: '', notification_date: '' });
    } catch (err) {
      console.error('Error adding notification:', err);
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
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (confirmDelete.isConfirmed) {
      // **Optimized Approach:**
      // 1. **Remove from UI first** (Makes it feel instant)
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );

      // 2. **API call runs in background, not blocking UI**
      axios
        .delete(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/${id}`)
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
      await axios.put(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/${id}`, editData);
      setEditingId(null);
      fetchNotifications();
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  // Toggle notification status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await axios.patch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/status/${id}`, { notification_status: newStatus });
      fetchNotifications();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (


    <div className="p-6 ml-80"> {/* Sidebar offset */}

      {/* Header Row */}
      <div className="bg-white mt-4 rounded-lg shadow-lg p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-bold">Notification Manager</h2>
          <button
            className="bg-[#00234E] text-white px-4 py-2 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Notification
          </button>
        </div>

        {/* Outer Container for Table */}

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Distributor Notification</th>
              <th className="border border-gray-300 p-2">Customer Notification</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <tr key={notification.notification_id}>
                  <td className="border border-gray-300 p-2 text-center">{notification.notification_id}</td>

                  {/* Editable fields */}
                  <td className="border border-gray-300 p-2">
                    {editingId === notification.notification_id ? (
                      <input
                        type="text"
                        name="distributor_notification"
                        value={editData.distributor_notification}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      notification.distributor_notification
                    )}
                  </td>

                  <td className="border border-gray-300 p-2">
                    {editingId === notification.notification_id ? (
                      <input
                        type="text"
                        name="customer_notification"
                        value={editData.customer_notification}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      notification.customer_notification
                    )}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {new Date(notification.notification_date).toLocaleDateString()}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      className={`px-3 py-1 rounded ${notification.notification_status === 'Active'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                      onClick={() =>
                        handleToggleStatus(notification.notification_id, notification.notification_status)
                      }
                    >
                      {notification.notification_status}
                    </button>
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    {editingId === notification.notification_id ? (
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleSaveEdit(notification.notification_id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleEdit(notification.notification_id)}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(notification.notification_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Add Notification</h3>

            <input
              type="text"
              name="distributor_notification"
              placeholder="Distributor Notification"
              value={newNotification.distributor_notification}
              onChange={handleNewInputChange}
              className="border p-2 w-full mb-3"
            />

            <input
              type="text"
              name="customer_notification"
              placeholder="Customer Notification"
              value={newNotification.customer_notification}
              onChange={handleNewInputChange}
              className="border p-2 w-full mb-3"
            />



            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleAddNotification}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
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
