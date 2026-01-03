import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";
import API_BASE_URL from "../config/api";

const DistributorCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [commissionInputs, setCommissionInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [distributorSearch, setDistributorSearch] = useState("");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);

  useEffect(() => {
    fetchCommissions();
    fetchDistributors();
    fetchCategoriesAndAllSubcats();

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.distributor-dropdown-container')) {
        setShowDistributorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedDistributor) {
      loadCommissionsForDistributor();
    }
  }, [selectedDistributor, commissions]);

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
          all.push(...subs.map(sub => ({ ...sub, category_id: cat.category_id })));
        })
      );
      setAllSubcategories(all);
    } catch {
      Swal.fire("Error", "Could not load categories/subcategories", "error");
    }
  };

  const loadCommissionsForDistributor = () => {
    if (!selectedDistributor) return;
    
    const inputs = {};
    allSubcategories.forEach(sub => {
      const key = `${sub.category_id}_${sub.subcategory_id}`;
      const existing = commissions.find(
        c => c.distributor_id === +selectedDistributor && 
             c.category_id === sub.category_id && 
             c.subcategory_id === sub.subcategory_id
      );
      inputs[key] = existing ? existing.commission_amount.toString() : "";
    });
    setCommissionInputs(inputs);
  };

  const handleCommissionChange = (categoryId, subcategoryId, value) => {
    const key = `${categoryId}_${subcategoryId}`;
    setCommissionInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (!selectedDistributor) {
      return Swal.fire("Error", "Please select a distributor", "error");
    }

    const updates = [];
    Object.keys(commissionInputs).forEach(key => {
      const value = commissionInputs[key];
      if (value && value.trim() !== "") {
        const [category_id, subcategory_id] = key.split("_").map(Number);
        updates.push({
          distributor_id: +selectedDistributor,
          category_id,
          subcategory_id,
          commission_amount: parseFloat(value)
        });
      }
    });

    if (updates.length === 0) {
      return Swal.fire("Info", "No commissions to save", "info");
    }

    try {
      await Promise.all(
        updates.map(payload => {
          const existing = commissions.find(
            c => c.distributor_id === payload.distributor_id &&
                 c.category_id === payload.category_id &&
                 c.subcategory_id === payload.subcategory_id
          );
          
          if (existing) {
            return axios.put(`${API_BASE_URL}/distributor-commissions/${existing.id}`, {
              commission_amount: payload.commission_amount
            });
          } else {
            return axios.post(`${API_BASE_URL}/distributor-commissions`, payload);
          }
        })
      );

      Swal.fire("Success!", "Commissions saved successfully", "success");
      fetchCommissions();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save commissions", "error");
    }
  };

  const getDistributorName = (id) => {
    const dist = distributors.find(d => d.user_id === +id);
    return dist ? (dist.name || dist.full_name || dist.username || `User ${id}`) : "";
  };

  const filteredDistributors = distributors.filter(d => {
    const name = (d.name || d.full_name || d.username || "").toLowerCase();
    return name.includes(distributorSearch.toLowerCase());
  });

  const handleSelectDistributor = (id) => {
    setSelectedDistributor(id);
    setDistributorSearch(getDistributorName(id));
    setShowDistributorDropdown(false);
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.category_name : "N/A";
  };

  const getSubcategoryName = (id) => {
    const sub = allSubcategories.find(s => s.subcategory_id === id);
    return sub ? sub.subcategory_name : "N/A";
  };

  const filteredSubcategories = allSubcategories.filter(sub => {
    const categoryName = getCategoryName(sub.category_id).toLowerCase();
    const subcategoryName = sub.subcategory_name.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return categoryName.includes(search) || subcategoryName.includes(search);
  });

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-auto">
      <div className="bg-white shadow rounded border">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t">
          <h2 className="text-2xl font-bold text-center">Distributor-Specific Commissions</h2>
          <p className="text-center text-gray-600 text-sm mt-1">Set custom commission rates for individual distributors</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative distributor-dropdown-container">
              <label className="block font-semibold mb-2">Select Distributor</label>
              <input
                type="text"
                placeholder="Search and select distributor..."
                value={distributorSearch}
                onChange={(e) => {
                  setDistributorSearch(e.target.value);
                  setShowDistributorDropdown(true);
                  if (!e.target.value) setSelectedDistributor("");
                }}
                onFocus={() => setShowDistributorDropdown(true)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {showDistributorDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredDistributors.length > 0 ? (
                    filteredDistributors.map((d) => (
                      <div
                        key={d.user_id}
                        onClick={() => handleSelectDistributor(d.user_id)}
                        className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                      >
                        {d.name || d.full_name || d.username || `User ${d.user_id}`}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No distributors found</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2">Search Categories/Subcategories</label>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {selectedDistributor ? (
            <>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full border text-sm bg-white shadow rounded">
                  <thead className="bg-[#F58A3B14] border-b-2 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 border text-center font-semibold">Category</th>
                      <th className="px-4 py-3 border text-center font-semibold">Subcategory</th>
                      <th className="px-4 py-3 border text-center font-semibold">Commission Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubcategories.length ? (
                      filteredSubcategories.map((sub) => {
                        const key = `${sub.category_id}_${sub.subcategory_id}`;
                        return (
                          <tr key={key} className="hover:bg-orange-50">
                            <td className="px-4 py-3 border text-center">{getCategoryName(sub.category_id)}</td>
                            <td className="px-4 py-3 border text-center">{sub.subcategory_name}</td>
                            <td className="px-4 py-3 border text-center">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Enter amount"
                                value={commissionInputs[key] || ""}
                                onChange={(e) => handleCommissionChange(sub.category_id, sub.subcategory_id, e.target.value)}
                                className="w-32 border border-gray-300 rounded px-3 py-1 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 border text-center text-gray-500">
                          {searchTerm ? "No matching categories/subcategories found" : "No categories/subcategories available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveAll}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                >
                  <FaSave /> Save All Commissions
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Please select a distributor to set commission rates
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorCommissions;
