import React, { useState, useEffect, useMemo, Suspense } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import {
  FaUsers,
  FaStore,
  FaFileAlt,
  FaCogs,
  FaBoxes,
  FaClipboardList,
  FaFilePdf,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { Card, CardContent } from "@mui/material";

// Register the chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// Default placeholder values
const DEFAULT_COUNTS = {
  users: "-",
  distributors: "-",
  documents: "-",
  categories: "-",
  subcategories: "-",
  documentStatus: [],
};

const Adashinner = () => {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [categoryWiseCounts, setCategoryWiseCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    totalAmount: 0,
    pending: 0,
    pendingAmount: 0,
    approved: 0,
    approvedAmount: 0,
    rejected: 0,
    todayAmount: 0,
    todayCommission: 0,
    monthAmount: 0,
    monthCommission: 0,
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  // Static card definitions
  const staticCards = [
    {
      id: "customers",
      icon: FaUsers,
      title: "Users",
      color: "bg-[#FE1008]",
      linkTo: "/Userlist",
    }, // 🔴 Red
    {
      id: "distributors",
      icon: FaStore,
      title: "Distributors",
      color: "bg-[#1D4ED8]",
      linkTo: "/Distributorlistonly",
    }, // 🔵 Blue
    {
      id: "documents",
      icon: FaFileAlt,
      title: "Documents",
      color: "bg-[#FACC15]",
      linkTo: "/Verifydocumentshistory",
    }, // 🟡 Yellow
    {
      id: "categories",
      icon: FaCogs,
      title: "Categories",
      color: "bg-[#22C55E]",
      linkTo: null,
    }, // 🟢 Green
    {
      id: "subcategories",
      icon: FaBoxes,
      title: "Subcategories",
      color: "bg-[#9333EA]",
      linkTo: null,
    }, // 🟣 Purple
    {
      id: "recent",
      icon: FaClipboardList,
      title: "View Recent Applications",
      color: "bg-[#F97316]",
      onClick: () => navigate("/Recentapplications"),
    }, // 🟠 Orange
    {
      id: "sent",
      icon: FaClipboardList,
      title: "Sent Applications",
      color: "bg-[#E11D48]",
      onClick: () => navigate("/Assigndistributorlist"),
    }, // 🟥 Dark Pink/Red
    {
      id: "received",
      icon: FaClipboardList,
      title: "Received Documents",
      color: "bg-[#0EA5E9]",
      onClick: () => navigate("/Uploadeddocuments"),
    }, // 🟦 Light Blue
    {
      id: "completed",
      icon: FaClipboardList,
      title: "Completed Tasks",
      color: "bg-[#16A34A]",
      onClick: () => navigate("/Verifydocumentshistory"),
    }, // 🟢 Dark Green
  ];

  // Fetch all data in parallel
  useEffect(() => {
    // Check cache first
    const cachedData = localStorage.getItem("dashboardData");
    const cacheTimestamp = localStorage.getItem("dashboardDataTimestamp");

    // Use cache if it exists and is less than 5 minutes old
    if (cachedData && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge < 5 * 60 * 1000) {
        // 5 minutes
        try {
          const parsedData = JSON.parse(cachedData);
          setCounts(parsedData.counts || DEFAULT_COUNTS);
          setCategoryWiseCounts(parsedData.categoryWiseCounts || []);
          setCategories(parsedData.categories || []);
          setSubcategoriesMap(parsedData.subcategoriesMap || {});
          setCategoryCounts(parsedData.categoryCounts || []);
          setSubcategoryCounts(parsedData.subcategoryCounts || []);
          if (parsedData.paymentStats) {
            setPaymentStats(parsedData.paymentStats);
            setWalletBalance(parsedData.paymentStats.approvedAmount || 0);
          }
          return;
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      }
    }

    // Fetch all data in parallel
    const fetchAllData = async () => {
      try {
        // Create an array of promises for all API calls
        const promises = [
          fetch(`${API_BASE_URL}/statistics/counts`).then((res) =>
            res.json()
          ),
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/subcategories`),
          axios.get(`${API_BASE_URL}/statistics/cscounts`),
          axios.get(`${API_BASE_URL}/payment-requests`).catch(err => {
            console.error('Error fetching payment requests:', err);
            return { data: [] };
          }),
        ];

        // Wait for all promises to resolve
        const [
          countsData,
          categoriesResponse,
          subcategoriesResponse,
          csCountsResponse,
          paymentsResponse,
        ] = await Promise.all(promises);

        // Process the data
        const totalCounts = countsData.totalCounts || DEFAULT_COUNTS;
        const categoryWiseCounts = countsData.categoryWiseCounts || [];
        const categories = categoriesResponse.data || [];

        // Process subcategories
        const subcategoriesObj = {};
        (subcategoriesResponse.data || []).forEach((subcategory) => {
          const categoryId = subcategory.category.category_id;
          if (!subcategoriesObj[categoryId]) {
            subcategoriesObj[categoryId] = [];
          }
          subcategoriesObj[categoryId].push(subcategory);
        });

        // Process category and subcategory counts
        const categoryCounts =
          csCountsResponse.data?.pendingCategoryCounts || [];
        const subcategoryCounts =
          csCountsResponse.data?.pendingSubcategoryCounts || [];

        // Process payment statistics
        const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
        
        
        // Get today's date at midnight in local timezone
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Get first day of this month at midnight
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);


        // Debug: Check payment dates with proper parsing
        const todayPayments = payments.filter(p => {
          const paymentDate = new Date(p.updated_at);
          // Create date at midnight for comparison
          const paymentDateOnly = new Date(
            paymentDate.getFullYear(), 
            paymentDate.getMonth(), 
            paymentDate.getDate()
          );
          const isToday = paymentDateOnly.getTime() === today.getTime();
          if (isToday) {
            console.log('✅ Today payment found:', p.updated_at, '-> Parsed:', paymentDate, '-> Match!');
          }
          return isToday;
        });

        const monthPayments = payments.filter(p => {
          const paymentDate = new Date(p.created_at);
          return paymentDate >= thisMonth && paymentDate <= now;
        });

        console.log('📅 Today payments count:', todayPayments.length);
        console.log('📊 Month payments count:', monthPayments.length);

        const paymentStats = {
          total: payments.length,
          totalAmount: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
          pending: payments.filter(p => p.status === 'Pending').length,
          pendingAmount: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount || 0), 0),
          approved: payments.filter(p => p.status === 'Approved' || p.status === 'Paid').length,
          approvedAmount: payments.filter(p => p.status === 'Approved' || p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0),
          rejected: payments.filter(p => p.status === 'Rejected').length,
          todayAmount: todayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
          todayCommission: todayPayments.filter(p => p.status === 'Approved' || p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0),
          monthAmount: monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
          monthCommission: monthPayments.filter(p => p.status === 'Approved' || p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0),
        };

        console.log('💰 Payment Stats:', paymentStats);

        
        // Update state
        setCounts(totalCounts);
        setCategoryWiseCounts(categoryWiseCounts);
        setCategories(categories);
        setSubcategoriesMap(subcategoriesObj);
        setCategoryCounts(categoryCounts);
        setSubcategoryCounts(subcategoryCounts);
        setPaymentStats(paymentStats);
        setWalletBalance(paymentStats.approvedAmount);

        // Cache the data
        const cacheData = {
          counts: totalCounts,
          categoryWiseCounts,
          categories,
          subcategoriesMap: subcategoriesObj,
          categoryCounts,
          subcategoryCounts,
          paymentStats: paymentStats,
        };
        localStorage.setItem("dashboardData", JSON.stringify(cacheData));
        localStorage.setItem("dashboardDataTimestamp", Date.now().toString());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  const handleSubcategorySelect = (
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName
  ) => {
    navigate("/ElistPage", {
      state: {
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName,
      },
    });
  };
  // Memoized chart data
  const pieChartData = useMemo(
    () => ({
      labels: ["Approved", "Pending", "Rejected", "Completed"],
      datasets: [
        {
          data: [
            counts?.documentStatus?.find(({ status }) => status === "Approved")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Pending")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Rejected")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Completed")
              ?.count || 0,
          ],
          backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }),
    [counts]
  );

  const barChartData = useMemo(
    () => ({
      labels: [
        "Users",
        "Distributors",
        "Documents",
        "Categories",
        "Subcategories",
      ],
      datasets: [
        {
          label: "Total Counts",
          data: [
            counts?.customers || 0,
            counts?.distributors || 0,
            counts?.documents || 0,
            counts?.categories || 0,
            counts?.subcategories || 0,
          ],
          backgroundColor: "#36A2EB",
          borderColor: "#1D4ED8",
          borderWidth: 1,
        },
      ],
    }),
    [counts]
  );

  const doughnutChartData = useMemo(
    () => ({
      labels: categoryWiseCounts?.map(({ categoryName }) => categoryName) || [],
      datasets: [
        {
          label: "Category Wise Document Count",
          data:
            categoryWiseCounts?.map(({ documentCount }) =>
              parseInt(documentCount, 10)
            ) || [],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }),
    [categoryWiseCounts]
  );
  console.log(
    paymentStats
  )

  const pendingCount =
    counts?.documentStatus?.find(({ status }) => status === "Pending")?.count ||
    "0";

  // Get count for a specific card
  const getCountForCard = (cardId) => {
    if (cardId in counts) {
      return counts[cardId];
    }
    return null;
  };

  // Lazy load charts
  const LazyCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4"> Document Status</h2>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Total Counts</h2>
        <Bar data={barChartData} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Category-wise Tasks</h2>
        <Doughnut data={doughnutChartData} options={{ responsive: true }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 ml-[350px]">
      {/* Pending Modal */}
      {showPendingModal && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-white text-red-600 font-semibold rounded-lg shadow-xl border border-red-400 flex items-center justify-between w-[500px] z-[9999]">
          <p className="text-lg">🚨 Pending Count: {pendingCount}</p>
          <button
            className="text-red-600 text-xl font-bold hover:text-red-800"
            onClick={() => setShowPendingModal(false)}
          >
            &times;
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Total Counts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {staticCards.map((card) => {
          const count = getCountForCard(card.id);

          return (
            <div
              key={card.id}
              className={`${card.color} text-white flex items-center rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer`}
              onClick={card.onClick || (() => {})}
              style={{ height: "120px" }} // Increased Size
            >
              {/* Icon Section with Same Background Color */}
              <div
                className={`${card.color} flex items-center justify-center w-1/4 h-full rounded-l-lg`}
              >
                <card.icon className="text-white text-5xl" />{" "}
                {/* Increased icon size */}
              </div>

              {/* White Divider Line */}
              <div className="w-[2px] h-3/4 bg-white opacity-70"></div>

              {/* Text Section */}
              <div className="w-3/4 flex flex-col justify-center pl-3">
                {card.linkTo ? (
                  <Link to={card.linkTo} className="text-lg font-semibold">
                    {card.title}
                  </Link>
                ) : (
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                )}
                {count !== null && (
                  <p className="text-3xl font-bold">{count}</p>
                )}{" "}
                {/* Bigger count */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Commission Analytics Section */}
      {paymentStats && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-orange-500" />
            Payment & Commission Analytics
          </h2>
          
          {/* Payment Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Requests</p>
                  <p className="text-3xl font-bold">{paymentStats.total}</p>
                </div>
                <FaMoneyBillWave className="text-4xl opacity-80" />
              </div>
              <p className="text-sm mt-2 opacity-90">₹{paymentStats.totalAmount.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-3xl font-bold">{paymentStats.pending}</p>
                </div>
                <FaHourglassHalf className="text-4xl opacity-80" />
              </div>
              <p className="text-sm mt-2 opacity-90">₹{paymentStats.pendingAmount.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Approved/Paid</p>
                  <p className="text-3xl font-bold">{paymentStats.approved}</p>
                </div>
                <FaCheckCircle className="text-4xl opacity-80" />
              </div>
              <p className="text-sm mt-2 opacity-90">₹{paymentStats.approvedAmount.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Wallet Balance</p>
                  <p className="text-3xl font-bold">₹{walletBalance.toFixed(2)}</p>
                </div>
                <FaWallet className="text-4xl opacity-80" />
              </div>
              <p className="text-sm mt-2 opacity-90">Total Revenue</p>
            </div>
          </div>

          {/* Commission Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Commission Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="text-orange-500" />
                  <p className="text-sm font-medium text-gray-700">Today's Payment</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{paymentStats.todayAmount.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-500" />
                  <p className="text-sm font-medium text-gray-700">Today's Commission</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{paymentStats.todayCommission.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="text-blue-500" />
                  <p className="text-sm font-medium text-gray-700">Monthly Payment</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{paymentStats.monthAmount.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-purple-500" />
                  <p className="text-sm font-medium text-gray-700">Monthly Commission</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{paymentStats.monthCommission.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Subcategories Section */}
      <Card
        style={{ backgroundColor: "#374151", padding: "1px", marginTop: "0px" }}
      >
        <CardContent
          style={{
            backgroundColor: "#f97316",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            padding: "5px",
            display: "flex",
            alignItems: "left",
            marginRight: "675px",
          }}
        >
          <span style={{ marginRight: "15px" }}>📂</span> Application For
          Categories and Subcategories
        </CardContent>
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: "#f97316",
            margin: "auto",
            transform: "rotate(45deg)",
            marginTop: "-6px",
            marginLeft: "200px",
          }}
        ></div>
      </Card>

      {/* categories and subcategories */}
      <div className="space-y-8 w-full max-w-7xl mx-auto">
        {categories.length > 0 ? (
          categories.map((category) => {
            const categoryCount =
              categoryCounts.find(
                (count) => count.categoryName === category.category_name
              )?.pendingCount || "0";

            return (
              <div key={category.category_id} className="mb-8 mt-10">
                {/* ✅ Category Button with Icon & Styling */}
                <div
                  className="flex w-1/2 rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                  onClick={() =>
                    fetchSubcategories(
                      category.category_id,
                      category.category_name
                    )
                  }
                >
                  {/* ✅ Icon Section */}
                  <div className="bg-[#FDEDD3] p-3 flex items-center justify-center">
                    <FaFileAlt className="text-2xl text-orange-500" />
                  </div>

                  {/* ✅ Category Name Section */}
                  <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4 flex justify-between items-center">
                    <span className="text-lg font-medium">
                      {category.category_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      Pending: {categoryCount}
                    </span>
                  </div>
                </div>

                {/* ✅ Subcategories Grid */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {subcategoriesMap[category.category_id]?.length > 0 ? (
                    subcategoriesMap[category.category_id].map(
                      (subcategory) => {
                        const subcategoryCount =
                          subcategoryCounts.find(
                            (count) =>
                              count.subcategoryName ===
                              subcategory.subcategory_name
                          )?.pendingCount || "0";

                        return (
                          <div
                            key={subcategory.subcategory_id}
                            className="flex items-center bg-[#F58A3B14] border border-orange-400 rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() =>
                              handleSubcategorySelect(
                                category.category_id,
                                category.category_name,
                                subcategory.subcategory_id,
                                subcategory.subcategory_name
                              )
                            }
                          >
                            {/* ✅ Icon Section */}
                            <div className="mr-2">
                              <FaFilePdf className="text-xl text-orange-500" />
                            </div>

                            {/* ✅ Subcategory Name & Count */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-black">
                                {subcategory.subcategory_name}
                              </h4>
                              <span className="text-sm text-gray-600">
                                ({subcategoryCount})
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-gray-500 text-sm text-center col-span-3">
                      No subcategories available
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No categories available</p>
        )}
      </div>

      {/* Charts Section - Lazy loaded */}
      <div className="mt-10">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {showCharts && (
          <Suspense fallback={<div>Loading charts...</div>}>
            <LazyCharts />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Adashinner;
