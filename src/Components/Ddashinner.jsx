import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
// Base URL for API calls
// const BASE_URL = " /api/api";
const BASE_URL = " /api";

// Configure axios for faster responses
axios.defaults.timeout = 5000; // 5 second timeout
const api = axios.create({
  baseURL: BASE_URL,
  // headers: {
  //   "Cache-Control": "no-cache",
  //   Pragma: "no-cache",
  //   Expires: "0",
  // },
});

// Default notification
const DEFAULT_NOTIFICATION =
  "Welcome to the Distributor Management Portal! Manage your distributors, verify documents, and track requests seamlessly!";

const Ddashinner = () => {
  const [counts, setCounts] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    totalCompletedCertifiedUsers: 0,
    statusCounts: [],
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [distributorId, setDistributorId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  // Immediately load cached data if available
  useEffect(() => {
    try {
      // Load cached data immediately
      const cachedCategories = localStorage.getItem("distributorCategories");
      const cachedSubcategories = localStorage.getItem(
        "distributorSubcategories"
      );
      const cachedDashboard = localStorage.getItem("distributorDashboardData");

      if (cachedCategories) setCategories(JSON.parse(cachedCategories));
      if (cachedSubcategories)
        setSubcategories(JSON.parse(cachedSubcategories));

      if (cachedDashboard) {
        const dashData = JSON.parse(cachedDashboard);
        setCounts(dashData.counts || {});
        setCategoryCounts(dashData.categoryCounts || {});
        setSubcategoryCounts(dashData.subcategoryCounts || {});
        setNotifications(dashData.notifications || []);
      }
    } catch (e) {
      console.error("Error loading cached data:", e);
    }

    // Get distributor ID from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDistributorId(decodedToken.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch all data in parallel immediately
  useEffect(() => {
    // Fetch categories (no dependencies, fetch immediately)
    api
      .get(`/categories`)
      .then((response) => {
        setCategories(response.data);
        localStorage.setItem(
          "distributorCategories",
          JSON.stringify(response.data)
        );
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // Fetch subcategories (no dependencies, fetch immediately)
    api
      .get(`/subcategories`)
      .then((response) => {
        const subsByCategory = {};
        response.data.forEach((sub) => {
          const catId = sub.category.category_id;
          if (!subsByCategory[catId]) {
            subsByCategory[catId] = [];
          }
          subsByCategory[catId].push({
            subcategory_id: sub.subcategory_id,
            subcategory_name: sub.subcategory_name,
          });
        });

        setSubcategories(subsByCategory);
        localStorage.setItem(
          "distributorSubcategories",
          JSON.stringify(subsByCategory)
        );
      })
      .catch((error) => {
        console.error("Error fetching subcategories:", error);
      });

    // Fetch notifications (no dependencies, fetch immediately)
    api
      .get(`/notifications/active`)
      .then((response) => {
        const distributorNotifications = response.data.filter(
          (notif) =>
            notif.distributor_notification &&
            notif.notification_status === "Active"
        );
        setNotifications(distributorNotifications);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  }, []);

  // Fetch distributor-specific data once we have the ID
  useEffect(() => {
    if (!distributorId) return;

    // Fetch pending counts
    api
      .get(`/statistics/pending-counts/${distributorId}`)
      .then((response) => {
        // Convert array to object for O(1) lookups
        const catCounts = {};
        if (response.data.pendingCategoryCounts) {
          response.data.pendingCategoryCounts.forEach((item) => {
            catCounts[item.categoryName] = item.pendingCount;
          });
        }
        setCategoryCounts(catCounts);

        // Convert subcategory counts to object
        const subCounts = {};
        if (response.data.pendingSubcategoryCounts) {
          response.data.pendingSubcategoryCounts.forEach((item) => {
            subCounts[item.subcategoryName] = item.pendingCount;
          });
        }
        setSubcategoryCounts(subCounts);
      })
      .catch((error) => {
        console.error("Error fetching pending counts:", error);
      });

    // Fetch counts
    api
      .get(`/statistics/distributor-counts/${distributorId}`)
      .then((response) => {
        setCounts(response.data || {});

        // Update cache with all the latest data
        const cacheData = {
          counts: response.data,
          categoryCounts: categoryCounts,
          subcategoryCounts: subcategoryCounts,
          notifications: notifications,
        };
        localStorage.setItem(
          "distributorDashboardData",
          JSON.stringify(cacheData)
        );
      })
      .catch((error) => {
        console.error("Error fetching distributor counts:", error);
      });
  }, [distributorId, categoryCounts, subcategoryCounts, notifications]);

  // Handle category selection
  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory({ categoryId, categoryName });
  };

  // Handle subcategory selection and navigate to DlistPage
  const handleSubcategorySelect = (subcategoryId, subcategoryName) => {
    if (!selectedCategory) return;

    const { categoryId, categoryName } = selectedCategory;
    navigate("/DlistPage", {
      state: { categoryId, categoryName, subcategoryId, subcategoryName },
    });
  };

  // Memoize chart data
  const barChartData = useMemo(() => {
    const statusCounts = counts?.statusCounts || [];
    const statusData = {
      Uploaded: 0,
      Rejected: 0,
      Pending: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status === "Completed")
        statusData.Uploaded += parseInt(item.count);
      if (item.status === "Pending") statusData.Pending += parseInt(item.count);
      if (item.status === "Rejected")
        statusData.Rejected += parseInt(item.count);
    });

    return {
      labels: ["Uploaded", "Rejected", "Pending"],
      datasets: [
        {
          label: "Status Counts",
          data: [
            statusData.Uploaded || 0,
            statusData.Rejected || 0,
            statusData.Pending || 0,
          ],
          backgroundColor: ["green", "red", "orange"],
          borderColor: ["darkgreen", "darkred", "darkorange"],
          borderWidth: 1,
        },
      ],
    };
  }, [counts?.statusCounts]);

  // Get category count
  const getCategoryCount = (categoryName) => {
    return categoryCounts[categoryName] || 0;
  };

  // Get subcategory count
  const getSubcategoryCount = (subcategoryName) => {
    return subcategoryCounts[subcategoryName] || 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 ml-[300px]">
      <div className="w-full max-w-7xl bg-white p-6 shadow-xl rounded-lg">
        {/* Notification Marquee - Always visible */}
        <div
          style={{
            backgroundColor: "#FFFF99",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "50px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <marquee
            style={{ color: "#FF0000", fontWeight: "bold", fontSize: "16px" }}
          >
            {notifications.length > 0
              ? notifications.map(
                  (notif, index) => `📢 ${notif.distributor_notification} `
                )
              : DEFAULT_NOTIFICATION}
          </marquee>
        </div>

        {/* Static Cards with Dynamic Counts */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} md={4}>
            <Card
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#e74c3c",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <InsertChartIcon
                style={{ fontSize: "40px", marginRight: "90px" }}
              />
              <div
                style={{
                  flexGrow: 1,
                  marginLeft: "-75px",
                  borderLeft: "2px solid white",
                  paddingLeft: "10px",
                }}
              >
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  Total Documents
                </Typography>
                <Typography
                  variant="h4"
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  {counts.totalDocuments || 0}
                </Typography>
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Card
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#3498db",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <PeopleIcon style={{ fontSize: "40px", marginRight: "105px" }} />
              <div
                style={{
                  flexGrow: 1,
                  marginLeft: "-90px",
                  borderLeft: "2px solid white",
                  paddingLeft: "10px",
                }}
              >
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  Total Users
                </Typography>
                <Typography
                  variant="h4"
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  {counts.totalUsers || 0}
                </Typography>
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Card
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f1c40f",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <VerifiedUserIcon
                style={{ fontSize: "40px", marginRight: "75px" }}
              />
              <div
                style={{
                  flexGrow: 1,
                  marginLeft: "-60px",
                  borderLeft: "2px solid white",
                  paddingLeft: "10px",
                }}
              >
                <Typography
                  variant="h6"
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  Total Certified Users
                </Typography>
                <Typography
                  variant="h4"
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  {counts.totalCompletedCertifiedUsers || 0}
                </Typography>
              </div>
            </Card>
          </Grid>
        </Grid>

        {/* Application Section Header - Static */}
        <Card
          style={{
            backgroundColor: "#374151",
            padding: "1px",
            marginTop: "50px",
          }}
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

        {/* Categories and Subcategories Grid - Static structure with dynamic data */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-7xl mx-auto mt-6">
          {!selectedCategory
            ? categories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex w-full rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                  onClick={() =>
                    handleCategorySelect(
                      category.category_id,
                      category.category_name
                    )
                  }
                >
                  {/* Icon Section */}
                  <div className="bg-[#FDEDD3] p-3 flex items-center justify-center border-r border-gray-300">
                    <span className="text-orange-600 font-bold">PDF</span>
                  </div>

                  {/* Category Name Section */}
                  <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4 flex justify-between items-center">
                    <h3 className="text-lg md:text-xl text-black">
                      {category.category_name}
                    </h3>
                    <h3 className="text-lg md:text-2xl text-gray-700">
                      {getCategoryCount(category.category_name)}
                    </h3>
                  </div>
                </div>
              ))
            : (subcategories[selectedCategory.categoryId] || []).map(
                (subcategory) => (
                  <div
                    key={subcategory.subcategory_id}
                    className="flex w-full rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 overflow-hidden"
                    onClick={() =>
                      handleSubcategorySelect(
                        subcategory.subcategory_id,
                        subcategory.subcategory_name
                      )
                    }
                  >
                    {/* Icon Section */}
                    <div className="bg-[#FDEDD3] p-3 flex items-center justify-center border-r border-gray-300">
                      <span className="text-orange-600 font-bold">PDF</span>
                    </div>

                    {/* Subcategory Name Section */}
                    <div className="flex-1 bg-gray-100 hover:bg-orange-200 p-4 flex justify-between items-center">
                      <h3 className="text-lg md:text-xl text-black">
                        {subcategory.subcategory_name}
                      </h3>
                      <h3 className="text-lg md:text-2xl text-gray-700">
                        {getSubcategoryCount(subcategory.subcategory_name)}
                      </h3>
                    </div>
                  </div>
                )
              )}
        </div>

        {/* Chart Section - Always visible with static structure */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Document Status</h2>
          <div style={{ height: "300px" }}>
            <Bar
              data={barChartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ddashinner;
