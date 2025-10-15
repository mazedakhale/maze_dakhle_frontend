import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const ContactInfoTable = () => {
  const [contactInfos, setContactInfos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    phone: "",
    email: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [updatedContact, setUpdatedContact] = useState({
    phone: "",
    email: "",
    address: "",
  });
  const apiUrl = "http://localhost:3000/contact-info"; // Replace with your actual backend API

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(apiUrl);
      setContactInfos(response.data);
    } catch (error) {
      console.error("Error fetching contact info:", error);
    }
  };

  const handleAdd = async () => {
    const { phone, email, address } = newContact;
    if (!phone || !email || !address) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    try {
      await axios.post(apiUrl, newContact);
      Swal.fire("Success", "Contact info added!", "success");
      setIsAdding(false);
      setNewContact({ phone: "", email: "", address: "" });
      fetchContactInfo();
    } catch (error) {
      console.error("Error adding contact info:", error);
      Swal.fire("Error", "Failed to add contact info", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this contact info?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        Swal.fire("Deleted!", "Contact info has been deleted.", "success");
        fetchContactInfo();
      } catch (error) {
        console.error("Error deleting contact info:", error);
        Swal.fire("Error", "Failed to delete contact info", "error");
      }
    }
  };

  const handleEdit = (info) => {
    setEditingId(info.id);
    setUpdatedContact({ ...info });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${apiUrl}/${id}`, updatedContact);
      Swal.fire("Updated!", "Contact info updated.", "success");
      setEditingId(null);
      fetchContactInfo();
    } catch (error) {
      console.error("Error updating contact info:", error);
      Swal.fire("Error", "Failed to update", "error");
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Contact Info
          </h2>
          <button
            onClick={() => setIsAdding(false)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsAdding(true)}
            disabled={contactInfos.length > 0}
            className={`px-4 py-2 rounded flex items-center gap-2 transition duration-200 ${
              contactInfos.length > 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            <FaPlus /> Add Contact Info
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["ID", "Phone", "Email", "Address", "Actions"].map(
                  (header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {contactInfos.length > 0 ? (
                contactInfos.map((info, index) => (
                  <tr
                    key={info.id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {info.id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === info.id ? (
                        <input
                          value={updatedContact.phone}
                          onChange={(e) =>
                            setUpdatedContact({
                              ...updatedContact,
                              phone: e.target.value,
                            })
                          }
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        info.phone
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === info.id ? (
                        <input
                          value={updatedContact.email}
                          onChange={(e) =>
                            setUpdatedContact({
                              ...updatedContact,
                              email: e.target.value,
                            })
                          }
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        info.email
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === info.id ? (
                        <input
                          value={updatedContact.address}
                          onChange={(e) =>
                            setUpdatedContact({
                              ...updatedContact,
                              address: e.target.value,
                            })
                          }
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        info.address
                      )}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {editingId === info.id ? (
                        <button
                          onClick={() => handleUpdate(info.id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded mr-2 hover:bg-orange-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(info)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(info.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No contact info found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add Contact Info</h2>
            <input
              type="text"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
              className="w-full mb-2 p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className="w-full mb-2 p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={newContact.address}
              onChange={(e) =>
                setNewContact({ ...newContact, address: e.target.value })
              }
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfoTable;
