import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const Price = () => {
  const [prices, setPrices] = useState([]);
  const [categories, setCategories] = useState([]);

  // ← master list of every subcategory, used for table display
  const [allSubcategories, setAllSubcategories] = useState([]);

  // ← only the subcategories for the currently-selected modal category
  const [subcategories, setSubcategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    amount: "",
  });

  useEffect(() => {
    fetchPrices();
    fetchCategoriesAndAllSubcats();
  }, []);

  // 1) load prices
  const fetchPrices = async () => {
    try {
      const { data } = await axios.get("/api/prices");
      setPrices(data.map((p) => ({ ...p, amount: Number(p.amount) })));
    } catch {
      Swal.fire("Error", "Could not load prices", "error");
    }
  };

  // 2) load categories + build master subcategory list
  const fetchCategoriesAndAllSubcats = async () => {
    try {
      const { data: cats } = await axios.get(
        "/api/categories"
      );
      setCategories(cats);

      const all = [];
      // fetch each category’s subcats
      await Promise.all(
        cats.map(async (cat) => {
          const { data: subs } = await axios.get(
            `/api/subcategories/category/${cat.category_id}`
          );
          all.push(...subs);
        })
      );
      setAllSubcategories(all);
    } catch {
      Swal.fire("Error", "Could not load categories/subcategories", "error");
    }
  };

  // 3) when modal category changes, fetch only its subcats
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `/api/subcategories/category/${categoryId}`
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
    setFormData({ category_id: "", subcategory_id: "", amount: "" });
    setSubcategories([]);
    setModalOpen(true);
  };

  const openEditModal = (price) => {
    setEditId(price.id);
    setFormData({
      category_id: price.category_id.toString(),
      subcategory_id: price.subcategory_id.toString(),
      amount: price.amount.toString(),
    });
    fetchSubcategories(price.category_id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Enter Deletion Code",
      input: "text",
      inputPlaceholder: "0000",
      showCancelButton: true,
      confirmButtonText: "Delete",
      showLoaderOnConfirm: true,
      preConfirm: (v) =>
        v === "0000" ? true : Swal.showValidationMessage("Wrong code"),
      allowOutsideClick: () => !Swal.isLoading(),
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`/api/prices/${id}`);
      setPrices((p) => p.filter((x) => x.id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch {
      Swal.fire("Error", "Failed to delete price", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { category_id, subcategory_id, amount } = formData;
    if (!category_id || !subcategory_id || !amount) {
      return Swal.fire("Error", "All fields required", "error");
    }
    try {
      const payload = {
        category_id: +category_id,
        subcategory_id: +subcategory_id,
        amount: parseFloat(amount),
      };
      if (editId) {
        await axios.put(`/api/prices/${editId}`, payload);
        Swal.fire("Updated!", "", "success");
      } else {
        await axios.post("/api/prices", payload);
        Swal.fire("Added!", "", "success");
      }
      setModalOpen(false);
      fetchPrices();
    } catch {
      Swal.fire("Error", "Failed to save", "error");
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-auto">
      {/* Table */}
      <div className="bg-white shadow rounded border">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t">
          <h2 className="text-2xl font-bold text-center">Price Management</h2>
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-5 right-5 text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-4 flex justify-end">
          <button
            onClick={openAddModal}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <FaPlus /> Add Price
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border text-sm bg-white shadow rounded">
            <thead className="bg-[#F58A3B14] border-b-2">
              <tr>
                {["Category", "Subcategory", "Amount", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 border text-center font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.length ? (
                prices.map((p) => (
                  <tr key={p.id} className="hover:bg-orange-100">
                    <td className="px-4 py-3 border text-center">
                      {categories.find((c) => c.category_id === p.category_id)
                        ?.category_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 border text-center">
                      {allSubcategories.find(
                        (s) => s.subcategory_id === p.subcategory_id
                      )?.subcategory_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 border text-center">
                      {p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 border text-center space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 border text-center">
                    No prices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Price" : "Add Price"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold">Category</label>
                <select
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  className="w-full border p-2 rounded"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subcategory_id: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
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
                <label className="block font-semibold">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
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
                  {editId ? "Save Changes" : "Add Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Price;
