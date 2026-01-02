import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import API_BASE_URL from "../config/api";

const DistributorCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    distributor_id: "",
    category_id: "",
    subcategory_id: "",
    commission_amount: "",
  });

  useEffect(() => {
    fetchCommissions();
    fetchDistributors();
    fetchCategoriesAndAllSubcats();
  }, []);

  const fetchCommissions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/distributor-commissions`);
      setCommissions(data);
    } catch {
      Swal.fire("Error", "Could not load commissions", "error");
    }
  };

  const fetchDistributors = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/distributors`);
      console.log(data);
      setDistributors(data.filter(u => u.role?.toLowerCase() === 'distributor'));
    } catch {
      Swal.fire("Error", "Could not load distributors", "error");
    }
  };

  const fetchCategoriesAndAllSubcats = async () => {
    try {
      const { data: cats } = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(cats);

      const all = [];
      await Promise.all(
        cats.map(async (cat) => {
          const { data: subs } = await axios.get(
            `${API_BASE_URL}/subcategories/category/${cat.category_id}`
          );
          all.push(...subs);
        })
      );
      setAllSubcategories(all);
    } catch {
      Swal.fire("Error", "Could not load categories/subcategories", "error");
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/subcategories/category/${categoryId}`
      );
      setSubcategories(data);
    } catch {
      setSubcategories([]);
      Swal.fire("Error", "Could not load subcategories", "error");
    }
  };

  const handleCategoryChange = (e) => {
    const category_id = e.target.value;
    setFormData({ ...formData, category_id, subcategory_id: "" });
    fetchSubcategories(category_id);
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ distributor_id: "", category_id: "", subcategory_id: "", commission_amount: "" });
    setSubcategories([]);
    setModalOpen(true);
  };

  const openEditModal = (commission) => {
    setEditId(commission.id);
    setFormData({
      distributor_id: commission.distributor_id.toString(),
      category_id: commission.category_id.toString(),
      subcategory_id: commission.subcategory_id.toString(),
      commission_amount: commission.commission_amount.toString(),
    });
    fetchSubcategories(commission.category_id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this custom commission rate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/distributor-commissions/${id}`);
      setCommissions((p) => p.filter((x) => x.id !== id));
      Swal.fire("Deleted!", "Commission rate deleted successfully", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to delete", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { distributor_id, category_id, subcategory_id, commission_amount } = formData;
    
    if (!distributor_id || !category_id || !subcategory_id || !commission_amount) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    try {
      const payload = {
        distributor_id: +distributor_id,
        category_id: +category_id,
        subcategory_id: +subcategory_id,
        commission_amount: parseFloat(commission_amount),
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/distributor-commissions/${editId}`, {
          commission_amount: payload.commission_amount
        });
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post(`${API_BASE_URL}/distributor-commissions`, payload);
        Swal.fire("Added!", "", "success");
      }
      
      setModalOpen(false);
      fetchCommissions();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save", "error");
    }
  };

  const getDistributorName = (id) => {
    const dist = distributors.find(d => d.user_id === id);
    return dist ? (dist.name || dist.full_name || dist.username || "Unknown") : "Unknown";
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.category_name : "N/A";
  };

  const getSubcategoryName = (id) => {
    const sub = allSubcategories.find(s => s.subcategory_id === id);
    return sub ? sub.subcategory_name : "N/A";
  };

  const filteredCommissions = commissions.filter((c) => {
    const distributorName = getDistributorName(c.distributor_id).toLowerCase();
    const categoryName = getCategoryName(c.category_id).toLowerCase();
    const subcategoryName = getSubcategoryName(c.subcategory_id).toLowerCase();
    const commissionAmt = c.commission_amount.toString();
    const search = searchTerm.toLowerCase();

    return (
      distributorName.includes(search) ||
      categoryName.includes(search) ||
      subcategoryName.includes(search) ||
      commissionAmt.includes(search)
    );
  });

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-auto">
      <div className="bg-white shadow rounded border">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t">
          <h2 className="text-2xl font-bold text-center">Distributor-Specific Commissions</h2>
          <p className="text-center text-gray-600 text-sm mt-1">Set custom commission rates for individual distributors</p>
        </div>
        
        <div className="p-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by distributor, category, subcategory, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={openAddModal}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <FaPlus /> Add Custom Commission
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border text-sm bg-white shadow rounded">
            <thead className="bg-[#F58A3B14] border-b-2">
              <tr>
                {["Distributor", "Category", "Subcategory", "Commission Amount", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 border text-center font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.length ? (
                filteredCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-100">
                    <td className="px-4 py-3 border text-center">{getDistributorName(c.distributor_id)}</td>
                    <td className="px-4 py-3 border text-center">{getCategoryName(c.category_id)}</td>
                    <td className="px-4 py-3 border text-center">{getSubcategoryName(c.subcategory_id)}</td>
                    <td className="px-4 py-3 border text-center font-semibold text-green-600">
                      ₹{Number(c.commission_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 border text-center space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 border text-center">
                    {searchTerm ? "No matching commissions found." : "No custom commissions set. All distributors use default rates."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Commission" : "Add Custom Commission"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold">Distributor</label>
                <select
                  value={formData.distributor_id}
                  onChange={(e) => setFormData({ ...formData, distributor_id: e.target.value })}
                  className="w-full border p-2 rounded"
                  disabled={editId}
                >
                  <option value="">-- Select Distributor --</option>
                  {distributors.map((d) => (
                    <option key={d.user_id} value={d.user_id}>
                      {d.name || d.full_name || d.username || `User ${d.user_id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Category</label>
                <select
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  className="w-full border p-2 rounded"
                  disabled={editId}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Subcategory</label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  className="w-full border p-2 rounded"
                  disabled={editId}
                >
                  <option value="">-- Select Subcategory --</option>
                  {subcategories.map((s) => (
                    <option key={s.subcategory_id} value={s.subcategory_id}>
                      {s.subcategory_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Commission Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.commission_amount}
                  onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="e.g., 250"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {editId ? "Save Changes" : "Add Commission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorCommissions;
