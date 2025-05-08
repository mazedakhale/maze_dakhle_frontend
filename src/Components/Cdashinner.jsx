import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaCheckCircle,
  FaRupeeSign,
  FaClock,
  FaFolderOpen,
  FaFilePdf,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  // counts & data
  const [appliedCount, setAppliedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState([]);

  // categories/subcategories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // prices
  const [prices, setPrices] = useState([]);

  // required docs modal
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE_URL = "https://mazedakhale.in/api/categories";
  const SUBCATEGORIES_API_URL = "https://mazedakhale.in/api/subcategories";

  // decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.user_id);
    }
  }, []);

  // fetch dashboard data + prices
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`https://mazedakhale.in/api/userdashboard/total-applied/${userId}`)
      .then((res) => setAppliedCount(res.data.totalCount))
      .catch(() => { });

    axios
      .get(`https://mazedakhale.in/api/userdashboard/total-completed/${userId}`)
      .then((res) => setCompletedCount(res.data.totalCompleted))
      .catch(() => { });

    axios
      .get(`https://mazedakhale.in/api/userdashboard/category-counts/${userId}`)
      .then((res) => {
        const withColors = res.data.categories.map((item, i) => ({
          name: item.category,
          value: item.totalApplications,
          pending: item.pendingApplications,
          color: `hsl(${(i * 137.508) % 360},70%,50%)`,
        }));
        setCategoryData(withColors);
        setCategoryCounts(res.data.categories);
        setSubcategoryCounts(res.data.subcategories);
      })
      .catch(() => { });

    axios
      .get(`https://mazedakhale.in/api/userdashboard/status-count/${userId}`)
      .then((res) => {
        setStatusData(
          res.data.map((item) => ({
            status: item.status,
            count: +item.count,
          }))
        );
      })
      .catch(() => { });

    axios
      .get("https://mazedakhale.in/api/notifications/active")
      .then((res) => setNotifications(res.data))
      .catch(() => { });

    fetchCategories();
    fetchSubcategories();
    fetchPrices();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(API_BASE_URL);
      setCategories(data);
    } catch { }
  };

  const fetchSubcategories = async () => {
    try {
      const { data } = await axios.get(SUBCATEGORIES_API_URL);
      setSubcategories(data);
    } catch { }
  };

  const fetchPrices = async () => {
    try {
      const { data } = await axios.get("https://mazedakhale.in/api/prices");
      setPrices(data.map((p) => ({ ...p, amount: Number(p.amount) })));
    } catch { }
  };

  const fetchRequiredDocuments = async (catId, subId) => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/required-documents/${catId}/${subId}`
      );
      setRequiredDocuments(data);
      const files = {};
      data.forEach((doc) => {
        if (doc.file_url) files[doc.id] = doc.file_url;
      });
      setSelectedFiles(files);
      setIsModalOpen(true);
    } catch { }
  };

  const handleSubcategorySelect = (catId, catName, subId, subName, action) => {
    setSelectedCategory({ categoryId: catId, categoryName: catName });
    setSelectedSubcategory({ subcategoryId: subId, subcategoryName: subName });

    if (action === "apply") {
      fetchRequiredDocuments(catId, subId);
    } else {
      navigate("/Clistpage", {
        state: { catId, catName, subId, subName },
      });
    }
  };

  const handleAgreementChange = (e) => setIsAgreed(e.target.checked);

  const handleApply = () => {
    if (!isAgreed) {
      alert("Please agree to the terms.");
      return;
    }
    navigate("/Apply", {
      state: {
        ...selectedCategory,
        ...selectedSubcategory,
        selectedDocuments: requiredDocuments,
      },
    });
  };

  const generateColor = (index) => `hsl(${(index * 137.508) % 360},70%,50%)`;

  return (
    <div className="ml-80 mt-14 p-6 bg-gray-100 min-h-screen">
      {/* Notifications */}
      <div className="mb-6">
        {notifications.length ? (
          notifications.map((n, i) =>
            n.customer_notification ? (
              <marquee
                key={i}
                className="text-lg font-semibold text-blue-600 mb-2"
              >
                📢 {n.customer_notification}
              </marquee>
            ) : null
          )
        ) : (
          <p className="text-gray-500 text-center">No active notifications</p>
        )}
      </div>

      {/* Top Cards */}
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
            color: "bg-[#FE1008]",
            onClick: () => navigate("/customerapply"),
          },
          {
            icon: <FaCheckCircle size={30} />,
            count: completedCount,
            label: "Total Completed",
            color: "bg-[#22C55E]",
            onClick: () => navigate("/Customerhistory"),
          },
          {
            icon: <FaRupeeSign size={30} />,
            count: `₹${appliedCount * 150}`,
            label: "Total Transaction",
            color: "bg-[#7C00FF]",
          },
          {
            icon: <FaClock size={30} />,
            count: Math.max(appliedCount - completedCount, 0),
            label: "Pending Application",
            color: "bg-[#FFC510]",
            onClick: () => navigate("/Userpendinglist"),
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`${item.color} text-white flex items-center rounded-lg shadow-md cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            style={{ width: 250, height: 80 }}
          >
            <div
              className={`${item.color} flex items-center justify-center w-1/4 h-full`}
            >
              {React.cloneElement(item.icon, { className: "text-white" })}
            </div>
            <div className="w-[2px] h-3/4 bg-white opacity-70"></div>
            <div className="w-3/4 flex flex-col justify-center pl-3">
              <p className="text-sm font-semibold">{item.label}</p>
              <h3 className="text-2xl font-bold">{item.count}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Categories Header */}
      <Card style={{ backgroundColor: "#374151", marginTop: 50 }}>
        <CardContent
          style={{
            backgroundColor: "#f97316",
            color: "white",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span className="mr-2">📂</span>
          Application For Categories and Subcategories
        </CardContent>
      </Card>

      {/* Category & Subcategory Cards */}
      <div className="w-full max-w-7xl mx-auto mt-6">
        {categories.map((cat) => {
          const catCount = categoryCounts.find(
            (c) => c.category === cat.category_name
          );
          const pendingCat = catCount?.pendingApplications || 0;
          const children = subcategories.filter(
            (s) => s.category.category_id === cat.category_id
          );

          return (
            <div key={cat.category_id} className="mb-8">
              {/* Category Card */}
              <div
                className="flex w-1/2 rounded-lg shadow-md cursor-pointer overflow-hidden"
                onClick={() => fetchSubcategories(cat.category_id)}
              >
                <div className="bg-[#FDEDD3] p-3 flex items-center">
                  {cat.isPdf ? (
                    <FaFilePdf className="text-orange-500" />
                  ) : (
                    <FaFileAlt className="text-orange-500" />
                  )}
                </div>
                <div className="flex-1 bg-gray-100 p-4 hover:bg-orange-200">
                  <span className="text-lg font-medium">
                    {cat.category_name}
                  </span>
                  <span className="block text-sm text-gray-600">
                    Pending: {pendingCat}
                  </span>
                </div>
              </div>

              {/* Subcategory Cards */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {children.map((sub) => {
                  const subCount = subcategoryCounts.find(
                    (c) =>
                      c.subcategory === sub.subcategory_name &&
                      c.category === cat.category_name
                  );
                  const pendingSub = subCount?.pendingApplications || 0;

                  // find price for this cat+sub
                  const priceRec = prices.find(
                    (p) =>
                      p.category_id === cat.category_id &&
                      p.subcategory_id === sub.subcategory_id
                  );

                  return (
                    <div
                      key={sub.subcategory_id}
                      className="w-64 p-4 bg-[#F58A3B14] border border-orange-400 rounded-lg shadow-md text-center"
                    >
                      <h3 className="text-lg font-semibold">
                        {sub.subcategory_name}
                      </h3>
                      <p className="text-lg font-semibold text-orange-500 mt-1">
                        Price: {priceRec ? `₹${priceRec.amount.toFixed(2)}` : "N/A"}
                      </p>

                      <p className="text-sm text-gray-800 mt-1">
                        Pending: {pendingSub}
                      </p>
                      <div className="flex justify-center gap-3 mt-3">
                        <button
                          className="bg-blue-600 text-white px-4 py-1 rounded-md"
                          onClick={() =>
                            handleSubcategorySelect(
                              cat.category_id,
                              cat.category_name,
                              sub.subcategory_id,
                              sub.subcategory_name,
                              "list"
                            )
                          }
                        >
                          List
                        </button>
                        <button
                          className="bg-green-600 text-white px-4 py-1 rounded-md"
                          onClick={() =>
                            handleSubcategorySelect(
                              cat.category_id,
                              cat.category_name,
                              sub.subcategory_id,
                              sub.subcategory_name,
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
      </div>

      {/* Charts */}
      <div className="flex gap-6 mt-8">
        <div className="w-1/2 bg-white shadow-md p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">
            Application Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
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
        <div className="w-1/2 bg-white shadow-md p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Category Distribution</h2>
          {categoryData.length ? (
            <PieChart width={350} height={300}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Required Documents Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/5 max-h-[80vh] overflow-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Required Documents
            </h2>
            <ul className="mb-4">
              {requiredDocuments.map((doc) => (
                <li key={doc.id} className="mb-4">
                  <span className="font-semibold">{doc.document_names}</span>
                  {selectedFiles[doc.id] && (
                    <img
                      src={selectedFiles[doc.id]}
                      alt={doc.document_names}
                      className="mt-2 w-full rounded"
                    />
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={handleAgreementChange}
                className="mr-2"
              />
              <span>I agree to the terms and conditions</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="bg-blue-500 text-white px-5 py-2 rounded"
                disabled={!isAgreed || isUploading}
              >
                {isUploading ? "Uploading..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
