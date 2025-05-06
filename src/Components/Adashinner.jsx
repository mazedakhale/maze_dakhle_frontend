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
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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
  const navigate = useNavigate();

  // Static card definitions
  const staticCards = [
    {
      id: "users",
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
          fetch("https://mazedakhale.in/api/statistics/counts").then((res) =>
            res.json()
          ),
          axios.get("https://mazedakhale.in/api/categories"),
          axios.get("https://mazedakhale.in/api/subcategories"),
          axios.get("https://mazedakhale.in/api/statistics/cscounts"),
        ];

        // Wait for all promises to resolve
        const [
          countsData,
          categoriesResponse,
          subcategoriesResponse,
          csCountsResponse,
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

        // Update state
        setCounts(totalCounts);
        setCategoryWiseCounts(categoryWiseCounts);
        setCategories(categories);
        setSubcategoriesMap(subcategoriesObj);
        setCategoryCounts(categoryCounts);
        setSubcategoryCounts(subcategoryCounts);

        // Cache the data
        const cacheData = {
          counts: totalCounts,
          categoryWiseCounts,
          categories,
          subcategoriesMap: subcategoriesObj,
          categoryCounts,
          subcategoryCounts,
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
            counts?.users || 0,
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

  const pendingCount =
    counts?.documentStatus?.find(({ status }) => status === "Pending")?.count ||
    "-";

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
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {staticCards.map((card) => {
          const count = getCountForCard(card.id);

          return (
            <div
              key={card.id}
              className={`${card.color} text-white flex items-center rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer`}
              onClick={card.onClick || (() => {})}
              style={{ width: "320px", height: "120px" }} // Increased Size
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
