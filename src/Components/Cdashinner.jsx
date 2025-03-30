import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaCheckCircle, FaRupeeSign, FaClock, FaFolderOpen, FaFilePdf, FaFileAlt } from "react-icons/fa";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [appliedCount, setAppliedCount] = useState(0);
  const [subcategoryCounts, setSubcategoryCounts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE_URL = "http://13.201.37.154:3000/categories";
  const SUBCATEGORIES_API_URL = "http://13.201.37.154:3000/subcategories";

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
    axios.get(`http://13.201.37.154:3000/userdashboard/total-applied/${userId}`)
      .then((res) => setAppliedCount(res.data.totalCount))
      .catch((err) => console.error("Error fetching total applied:", err));

    // Fetch completed applications count
    axios.get(`http://13.201.37.154:3000/userdashboard/total-completed/${userId}`)
      .then((res) => setCompletedCount(res.data.totalCompleted))
      .catch((err) => console.error("Error fetching total completed:", err));

    // Fetch category counts
    axios.get(`http://13.201.37.154:3000/userdashboard/category-counts/${userId}`)
      .then((res) => {
        const categoryDataWithColors = res.data.categories.map((item, index) => ({
          name: item.category,
          value: item.totalApplications,
          pending: item.pendingApplications,
          color: generateColor(index),
        }));
        setCategoryData(categoryDataWithColors);
        setCategoryCounts(res.data.categories);
        setSubcategoryCounts(res.data.subcategories);
      })
      .catch((err) => console.error("Error fetching category data:", err));

    // Fetch application status counts
    axios.get(`http://13.201.37.154:3000/userdashboard/status-count/${userId}`)
      .then((res) => {
        const formattedData = res.data.map((item) => ({
          status: item.status,
          count: parseInt(item.count),
        }));
        setStatusData(formattedData);
      })
      .catch((err) => console.error("Error fetching status counts:", err));

    // Fetch active notifications
    axios.get("http://13.201.37.154:3000/notifications/active")
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Error fetching notifications:", err));

    // Fetch categories and subcategories
    fetchCategories();
    fetchSubcategories();
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

  // Fetch all subcategories
  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(SUBCATEGORIES_API_URL);
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Fetch required documents for a category and subcategory
  const fetchRequiredDocuments = async (categoryId, subcategoryId) => {
    try {
      const response = await axios.get(
        `http://13.201.37.154:3000/required-documents/${categoryId}/${subcategoryId}`
      );
      setRequiredDocuments(response.data);
      setIsModalOpen(true);

      // Set selected documents and pre-fill file URLs if available
      const files = {};
      response.data.forEach((doc) => {
        if (doc.file_url) {
          files[doc.id] = doc.file_url;
        }
      });
      setSelectedFiles(files);
    } catch (error) {
      console.error("Error fetching required documents:", error);
    }
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

  // Handle subcategory selection (List or Apply)
  const handleSubcategorySelect = (categoryId, categoryName, subcategoryId, subcategoryName, action) => {
    // Set the selectedCategory state
    setSelectedCategory({ categoryId, categoryName });

    if (action === "apply") {
      setSelectedSubcategory({ subcategoryId, subcategoryName });
      fetchRequiredDocuments(categoryId, subcategoryId); // Fetch required documents
      setIsModalOpen(true); // Open the modal
    } else {
      // Navigate to ClistPage with state
      navigate("/Clistpage", {
        state: {
          categoryId,
          categoryName,
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

  // Handle agreement checkbox change
  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  return (
    <div className="ml-80 mt-14 p-6 bg-gray-100 min-h-screen">
      {/* Notifications */}
      <div className="mb-6">
        {notifications.length > 0 ? (
          notifications.map((notif, index) =>
            notif.customer_notification ? (
              <marquee key={index} className="text-lg font-semibold text-blue-600 mb-2">
                📢 {notif.customer_notification}
              </marquee>
            ) : null
          )
        ) : (
          <p className="text-gray-500 text-center">No active notifications</p>
        )}
      </div>

      {/* Top Cards Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {[
          {
            icon: <FaClipboardList size={30} />,
            count: appliedCount,
            label: "Total Document",
            color: "bg-[#FE1008]", // Red
            onClick: () => navigate("/customerapply"),
          },
          {
            icon: <FaCheckCircle size={30} />,
            count: completedCount,
            label: "Total Completed",
            color: "bg-[#22C55E]", // Green
            onClick: () => navigate("/Usercompletedlist"),
          },
          {
            icon: <FaRupeeSign size={30} />,
            count: `₹${appliedCount * 150}`,
            label: "Total Transaction",
            color: "bg-[#7C00FF]", // Purple
          },
          {
            icon: <FaClock size={30} />,
            count: Math.max(appliedCount - completedCount, 0),
            label: "Pending Application",
            color: "bg-[#FFC510]", // Yellow
            onClick: () => navigate("/Userpendinglist"),
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`${item.color} text-white flex items-center rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            style={{ width: "250px", height: "80px" }} // Fixed size
          >
            {/* Icon Section with Same Background Color */}
            <div className={`${item.color} flex items-center justify-center w-1/4 h-full rounded-l-lg`}>
              {React.cloneElement(item.icon, { className: "text-white" })}
            </div>

            {/* White Divider Line */}
            <div className="w-[2px] h-3/4 bg-white opacity-70"></div>

            {/* Text Section */}
            <div className="w-3/4 flex flex-col justify-center pl-3">
              <p className="text-sm font-semibold">{item.label}</p>
              <h3 className="text-2xl font-bold">{item.count}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Categories and Subcategories Section */}
      <Card style={{ backgroundColor: "#374151", padding: "1px", marginTop: "50px" }}>
        <CardContent style={{ backgroundColor: "#f97316", color: "white", fontSize: "16px", fontWeight: "600", padding: "5px", display: "flex", alignItems: "left", marginRight: "675px" }}>
          <span style={{ marginRight: "15px" }}>📂</span> Application For Categories and Subcategories
        </CardContent>
        <div style={{ width: "12px", height: "12px", backgroundColor: "#f97316", margin: "auto", transform: "rotate(45deg)", marginTop: "-6px", marginLeft: "200px" }}></div>
      </Card>


      {/* Categories and Subcategories */}

      <div className="w-full max-w-7xl mx-auto mt-6">
        {categories.map((category) => {
          const categoryData = categoryCounts.find(
            (count) => count.category === category.category_name
          );
          const pendingCount = categoryData?.pendingApplications || 0;

          // Filter subcategories for the current category
          const categorySubcategories = subcategories.filter(
            (sub) => sub.category.category_id === category.category_id
          );

          return (
            <div key={category.category_id} className="mb-8">
              {/* ✅ Category Card (Unchanged) */}
              <div
                className="flex w-1/2 rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                onClick={() => fetchSubcategories(category.category_id, category.category_name)}
              >
                {/* ✅ PDF/Icon Section with Separate BG */}
                <div className="bg-[#FDEDD3] p-3 flex items-center justify-center">
                  {category.isPdf ? (
                    <FaFilePdf className="text-2xl text-orange-500" />
                  ) : (
                    <FaFileAlt className="text-2xl text-orange-500" />
                  )}
                </div>

                {/* ✅ Category Name Section */}
                <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4">
                  <span className="text-lg font-medium">{category.category_name}</span>
                  <span className="block text-sm text-gray-600">Pending: {pendingCount}</span>
                </div>
              </div>

              {/* ✅ Updated Subcategories Cards */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {categorySubcategories.map((subcategory) => {
                  const subcategoryData = subcategoryCounts.find(
                    (count) =>
                      count.subcategory === subcategory.subcategory_name &&
                      count.category === category.category_name
                  );
                  const subPending = subcategoryData?.pendingApplications || 0;

                  return (
                    <div
                      key={subcategory.subcategory_id}
                      className="w-64 p-4 bg-[#F58A3B14] border border-orange-400 rounded-lg shadow-md text-center"
                    >
                      {/* ✅ Subcategory Title */}
                      <h3 className="text-lg font-semibold text-black">{subcategory.subcategory_name}</h3>

                      {/* ✅ Pending Count */}
                      <p className="text-sm text-gray-800 mt-1">Total · Pending : {subPending}</p>

                      {/* ✅ Buttons */}
                      <div className="flex justify-center gap-3 mt-3">
                        <button
                          className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm shadow-md"
                          onClick={() =>
                            handleSubcategorySelect(
                              category.category_id,
                              category.category_name,
                              subcategory.subcategory_id,
                              subcategory.subcategory_name,
                              "list"
                            )
                          }
                        >
                          List
                        </button>

                        <button
                          className="bg-green-600 text-white px-4 py-1 rounded-md text-sm shadow-md"
                          onClick={() =>
                            handleSubcategorySelect(
                              category.category_id,
                              category.category_name,
                              subcategory.subcategory_id,
                              subcategory.subcategory_name,
                              "apply"
                            )
                          }
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>;




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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/5 h-4/5 max-w-[800px] max-h-[1200px] shadow-xl overflow-auto relative">
            {/* Cross (Close) Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 border-b pb-3">
              Required Documents
            </h2>

            <ul className="mb-4 max-h-[500px] overflow-y-auto">
              {requiredDocuments.map((doc) => (
                <li key={doc.id} className="mb-4 py-2 px-4 text-md hover:bg-gray-50 rounded">
                  <span className="font-semibold">{doc.document_names}</span>
                  {/* Display the previously uploaded image */}
                  {selectedFiles[doc.id] && (
                    <div className="mt-2">
                      <img
                        src={selectedFiles[doc.id]} // Use the file URL from the backend
                        alt={`Uploaded ${doc.document_names}`}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}
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
                className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                disabled={!isAgreed || isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;   