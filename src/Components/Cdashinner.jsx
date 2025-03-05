import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaCheckCircle, FaRupeeSign, FaClock } from "react-icons/fa";


const CustomerDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate here
  const [userId, setUserId] = useState(null);
  const [appliedCount, setAppliedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const API_BASE_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories";
  const SUBCATEGORIES_API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories";

  // Decode token and set user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.user_id);
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!userId) return;

    // Fetch applied applications count
    axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/total-applied/${userId}`)
      .then(res => setAppliedCount(res.data.totalCount))
      .catch(err => console.error("Error fetching total applied:", err));

    // Fetch completed applications count
    axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/total-completed/${userId}`)
      .then(res => setCompletedCount(res.data.totalCompleted))
      .catch(err => console.error("Error fetching total completed:", err));

    // Fetch category counts
    axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/category-counts/${userId}`)
      .then(res => {
        const dataWithColors = res.data.map((item, index) => ({
          name: item.category,
          value: item.totalApplications,
          color: generateColor(index),
        }));
        setCategoryData(dataWithColors);
        setCategoryCounts(res.data);
      })
      .catch(err => console.error("Error fetching category data:", err));

    // Fetch application status counts
    axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/userdashboard/status-count/${userId}`)
      .then(res => {
        const formattedData = res.data.map(item => ({
          status: item.status,
          count: parseInt(item.count),
        }));
        setStatusData(formattedData);
      })
      .catch(err => console.error("Error fetching status counts:", err));

    // Fetch active notifications
    axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/active")
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Error fetching notifications:", err));

    // Fetch categories initially
    fetchCategories();
  }, [userId]);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories for a specific category
  const fetchSubcategories = async (categoryId, categoryName) => {
    try {
      const response = await axios.get(SUBCATEGORIES_API_URL);
      const filteredSubcategories = response.data.filter(
        (sub) => sub.category.category_id === categoryId
      );
      setSubcategories(filteredSubcategories);
      setSelectedCategory({ categoryId, categoryName });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Fetch required documents for a category and subcategory
  const fetchRequiredDocuments = async (categoryId, subcategoryId) => {
    try {
      const response = await axios.get(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/required-documents/${categoryId}/${subcategoryId}`);
      setRequiredDocuments(response.data);
      setIsModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching required documents:", error);
    }
  };

  // Handle document selection
  const handleDocumentSelection = (documentId) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId) // Deselect if already selected
        : [...prev, documentId] // Select if not already selected
    );
  };

  // Handle apply logic
  const handleApply = () => {
    if (!isAgreed) {
      alert("Please agree to the terms before proceeding.");
      return;
    }
    // Navigate to the Apply page
    navigate("/Apply", {
      state: {
        categoryId: selectedCategory.categoryId,
        categoryName: selectedCategory.categoryName,
        subcategoryId: selectedSubcategory.subcategoryId,
        subcategoryName: selectedSubcategory.subcategoryName,
        selectedDocuments,
      },
    });
  };
  const handleSubcategorySelect = (subcategoryId, subcategoryName, action) => {
    if (action === "apply") {
      setSelectedSubcategory({ subcategoryId, subcategoryName });
      fetchRequiredDocuments(selectedCategory.categoryId, subcategoryId); // Fetch required documents
      setIsModalOpen(true); // Open the modal
    } else {
      navigate("/Clistpage", {
        state: {
          categoryId: selectedCategory.categoryId,
          categoryName: selectedCategory.categoryName,
          subcategoryId,
          subcategoryName,
        },
      });
    }
  };

  // Generate dynamic colors
  const generateColor = (index) => {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };
  return (
    <div className="ml-80 mt-14 p-6">
      {/* Notifications */}
      <div className="mb-6">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            notif.customer_notification && (
              <marquee key={index} className="text-lg font-semibold text-blue-600 mb-2">
                📢 {notif.customer_notification}
              </marquee>
            )
          ))
        ) : (
          <p className="text-gray-500 text-center">No active notifications</p>
        )}
      </div>

      {/* Top Cards Section */}
      <motion.div
        className="grid grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {[
          { icon: <FaClipboardList size={40} />, count: appliedCount, label: "Total Applied", color: "bg-blue-300", onClick: () => navigate('/customerapply') },
          { icon: <FaCheckCircle size={40} />, count: completedCount, label: "Total Completed", color: "bg-green-300", onClick: () => navigate('/Usercompletedlist') },
          { icon: <FaRupeeSign size={40} />, count: `₹${appliedCount * 150}`, label: "Total Transaction", color: "bg-purple-300" },
          { icon: <FaClock size={40} />, count: Math.max(appliedCount - completedCount, 0), label: "Pending Applications", color: "bg-yellow-300", onClick: () => navigate('/Userpendinglist') }
        ].map((item, index) => (
          <div
            key={index}
            className={`${item.color} text-gray-800 p-6 rounded-xl shadow-md text-center hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2`}
            onClick={item.onClick}
          >
            {item.icon}
            <h3 className="text-2xl font-bold">{item.count}</h3>
            <p className="text-lg">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Categories and Subcategories Section */}
      <h4 className="mt-8 text-xl font-semibold text-gray-700 ml-5">Application For Categories and Subcategories</h4>
      <div className="grid grid-cols-3 gap-4 w-full max-w-7xl mx-auto mt-4">
        {!selectedCategory ? (
          categories.map((category) => {
            const categoryCount = categoryCounts.find(
              (count) => count.category === category.category_name
            )?.totalApplications;

            return (
              <div
                key={category.category_id}
                className="flex flex-col items-center justify-center p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => fetchSubcategories(category.category_id, category.category_name)}
              >
                <h3 className="text-lg font-semibold">{category.category_name}</h3>
                <p className="card-text">({categoryCount || 0})</p>
              </div>
            );
          })
        ) : (
          subcategories.map((subcategory) => (
            <div
              key={subcategory.subcategory_id}
              className="flex flex-col items-center justify-center p-4 bg-white rounded shadow"
            >
              <h3 className="text-lg font-semibold">{subcategory.subcategory_name}</h3>
              <div className="flex gap-2 mt-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleSubcategorySelect(subcategory.subcategory_id, subcategory.subcategory_name, "list")}>
                  List
                </button>
                <button className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    fetchRequiredDocuments(selectedCategory.categoryId, subcategory.subcategory_id);
                    setSelectedSubcategory({
                      subcategoryId: subcategory.subcategory_id,
                      subcategoryName: subcategory.subcategory_name,
                    });
                  }}>
                  Apply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="flex gap-6">
        {/* Bar Chart */}
        <div className="w-1/2 bg-white shadow-md border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Application Status Overview</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EA580C" barSize={40}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="w-1/2 bg-white shadow-md border rounded-xl p-6 flex flex-col items-center justify-center relative">
          <h2 className="text-xl font-bold mb-4">Category Distribution</h2>
          {categoryData.length > 0 ? (
            <PieChart width={430} height={400}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          ) : (
            <p className="text-lg font-semibold text-gray-500 text-center">No data available</p>
          )}
        </div>
      </div>

      {/* Modal for Required Documents - Medium Size */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-2/5 max-h-[550px] shadow-xl overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 border-b pb-3">
              Required Documents
            </h2>

            <ul className="mb-4 max-h-[250px] overflow-y-auto">
              {requiredDocuments.map((doc) => (
                <li key={doc.id} className="mb-2 py-1.5 px-2 text-md hover:bg-gray-50 rounded">
                  <span>{doc.document_names}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center mb-4 text-md bg-gray-50 p-3 rounded">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={handleAgreementChange}
                className="mr-2 h-5 w-5 accent-blue-500"
              />
              <span>I agree to the terms and conditions</span>
            </div>

            <div className="flex justify-center mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded mr-4 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition-colors"
                disabled={!isAgreed}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default CustomerDashboard;