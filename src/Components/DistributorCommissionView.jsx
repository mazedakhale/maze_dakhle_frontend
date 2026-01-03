import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import API_BASE_URL from "../config/api";

const DistributorCommissionView = () => {
  const [commissions, setCommissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire("Error", "Authentication token not found", "error");
        return;
      }

      const decoded = jwtDecode(token);
      const distributorId = decoded.user_id;

      if (!distributorId) {
        Swal.fire("Error", "User ID not found in token", "error");
        return;
      }

      // Fetch commissions for this distributor
      const { data: allCommissions } = await axios.get(`${API_BASE_URL}/distributor-commissions`);
      const myCommissions = allCommissions.filter(c => c.distributor_id === distributorId);
      setCommissions(myCommissions);

      // Fetch categories
      const { data: cats } = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(cats);

      // Fetch all subcategories
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

      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not load commission data", "error");
      setLoading(false);
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.category_name : "N/A";
  };

  const getSubcategoryName = (id) => {
    const sub = allSubcategories.find(s => s.subcategory_id === id);
    return sub ? sub.subcategory_name : "N/A";
  };

  const getCommissionForDocument = (categoryId, subcategoryId) => {
    const commission = commissions.find(
      c => c.category_id === categoryId && c.subcategory_id === subcategoryId
    );
    return commission ? commission.commission_amount : null;
  };

  const filteredSubcategories = allSubcategories.filter(sub => {
    const categoryName = getCategoryName(sub.category_id).toLowerCase();
    const subcategoryName = sub.subcategory_name.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return categoryName.includes(search) || subcategoryName.includes(search);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-300px)] overflow-x-auto">
      <div className="bg-white shadow rounded border">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t">
          <h2 className="text-2xl font-bold text-center">My Commission Rates</h2>
          <p className="text-center text-gray-600 text-sm mt-1">View your custom commission rates for each document type</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search categories or subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="text-sm text-gray-600">
              Total Custom Rates: <span className="font-semibold">{commissions.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border text-sm bg-white shadow rounded">
              <thead className="bg-[#F58A3B14] border-b-2 sticky top-0">
                <tr>
                  <th className="px-4 py-3 border text-center font-semibold">Category</th>
                  <th className="px-4 py-3 border text-center font-semibold">Subcategory</th>
                  <th className="px-4 py-3 border text-center font-semibold">Commission Amount</th>
                  <th className="px-4 py-3 border text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubcategories.length ? (
                  filteredSubcategories.map((sub) => {
                    const commission = getCommissionForDocument(sub.category_id, sub.subcategory_id);
                    return (
                      <tr key={`${sub.category_id}_${sub.subcategory_id}`} className={commission ? "bg-green-50" : "hover:bg-gray-50"}>
                        <td className="px-4 py-3 border text-center">{getCategoryName(sub.category_id)}</td>
                        <td className="px-4 py-3 border text-center">{sub.subcategory_name}</td>
                        <td className="px-4 py-3 border text-center">
                          {commission ? (
                            <span className="font-semibold text-green-600">₹{Number(commission).toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">Default Rate</span>
                          )}
                        </td>
                        <td className="px-4 py-3 border text-center">
                          {commission ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Custom Rate
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              Standard Rate
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 border text-center text-gray-500">
                      {searchTerm ? "No matching categories/subcategories found" : "No categories/subcategories available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {commissions.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
              <p className="text-blue-800">
                You are currently using default commission rates for all document types.
                <br />
                Contact the admin if you need custom rates for specific documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributorCommissionView;
