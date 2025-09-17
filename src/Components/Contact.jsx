import React, { useEffect, useState } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [fieldKeys, setFieldKeys] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // fields from Field API
  const navigate = useNavigate();
  const contactApiUrl = "http://localhost:3000/contact";
  const fieldApiUrl = "http://localhost:3000/field";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Step 1: Get field keys
      const fieldRes = await axios.get(fieldApiUrl);
      const keys = fieldRes.data.map((f) => f.key);
      setFieldKeys(keys);

      // Step 2: Get contact entries
      const contactRes = await axios.get(contactApiUrl);
      const normalizedContacts = contactRes.data.map((contact) => {
        let flatData = {};

        if (contact.data?.key && contact.data?.value) {
          // old structure
          flatData[contact.data.key] = contact.data.value;
        } else {
          flatData = { ...contact.data };
        }

        return {
          id: contact.id,
          createdAt: contact.createdAt,
          data: flatData,
        };
      });

      setContacts(normalizedContacts);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to fetch contact or fields", "error");
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-auto">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
          {/* Header */}
          <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              User Contacts List
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
        </div>

        <div className="p-6">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                <th className="px-4 py-3 border text-center">ID</th>
                {fieldKeys.map((key, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 border text-center capitalize"
                  >
                    {key}
                  </th>
                ))}
                <th className="px-4 py-3 border text-center">Created At</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-orange-100">
                  <td className="px-4 py-3 border text-center">{contact.id}</td>
                  {fieldKeys.map((key, i) => (
                    <td key={i} className="px-4 py-3 border text-center">
                      {contact.data[key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-3 border text-center">
                    {new Date(contact.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={fieldKeys.length + 2}
                    className="px-4 py-3 text-center border"
                  >
                    No contact entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contact;
