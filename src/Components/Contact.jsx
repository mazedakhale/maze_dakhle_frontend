import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [fieldKeys, setFieldKeys] = useState([]); // fields from Field API

    const contactApiUrl = "https://mazedakhale.in/api/contact";
    const fieldApiUrl = "https://mazedakhale.in/api/field";

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
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-gray-800">Submitted Contact Entries</h2>
                </div>

                <div className="p-6">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                <th className="px-4 py-3 border text-center">ID</th>
                                {fieldKeys.map((key, index) => (
                                    <th key={index} className="px-4 py-3 border text-center capitalize">
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
                                    <td colSpan={fieldKeys.length + 2} className="px-4 py-3 text-center border">
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
