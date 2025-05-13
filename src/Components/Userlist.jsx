import React, { useEffect, useState } from "react";
import axios from "axios";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://mazedakhale.in/api/users/register"
        );
        const distributors = response.data.filter(
          (user) => user.role === "Customer"
        );
        setUsers(distributors);
        setFilteredUsers(distributors);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      Object.values(user).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(query)
      )
    );
    setFilteredUsers(filtered);
  };

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="w-[calc(100%-260px)] ml-[310px] mt-[80px] p-6">
      {/* Outer Container */}
      <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
          <h2 className="text-2xl font-bold text-gray-800">User List</h2>
          <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
          />
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
            {/* Table Header */}
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {[
                  "User ID",
                  "Name",
                  "Email",
                  "Phone",
                  "Role",
                  "Login Status",
                  "Created At",
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

            {/* Table Body */}
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user?.user_id}
                    className={`${
                      index % 2 === 0 ? "bg-[#FFFF]" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100 transition duration-200`}
                  >
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.user_id}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.email || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.role}
                    </td>
                    <td
                      className={`px-4 py-3 border border-[#776D6DA8] text-center ${
                        user?.user_login_status === "Approve"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {user?.user_login_status}
                    </td>
                    <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-3 border border-[#776D6DA8] text-center"
                  >
                    No users found.
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

export default UserTable;
