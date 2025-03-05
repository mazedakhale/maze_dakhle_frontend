import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/register');
        const distributors = response.data.filter(user => user.role === 'Distributor');
        setUsers(distributors);
        setFilteredUsers(distributors);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
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
        String(val || '').toLowerCase().includes(query)
      )
    );
    setFilteredUsers(filtered);
  };

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="ml-[330px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      {/* Main Content */}
      <div className="w-full max-w-8xl p-8 bg-white rounded-lg shadow-md">
        {/* Header with Title and Search */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Distributor List</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 border-b text-center">User ID</th>
                <th className="py-3 px-4 border-b text-center">Name</th>
                <th className="py-3 px-4 border-b text-center">Email</th>
                <th className="py-3 px-4 border-b text-center">Phone</th>
                <th className="py-3 px-4 border-b text-center">Role</th>
                <th className="py-3 px-4 border-b text-center">Login Status</th>
                <th className="py-3 px-4 border-b text-center">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user?.user_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-center">{user?.user_id}</td>
                    <td className="py-2 px-4 border-b text-center">{user?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-center">{user?.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-center">{user?.phone || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-center">{user?.role}</td>
                    <td className={`py-2 px-4 border-b text-center ${user?.user_login_status === 'Approve' ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.user_login_status}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
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
