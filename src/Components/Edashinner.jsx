import React, { useState, useEffect, useMemo } from "react";
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
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@mui/material";

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

const DEFAULT_COUNTS = {
  users: "-",
  distributors: "-",
  documents: "-",
  categories: "-",
  subcategories: "-",
  documentStatus: [],
};

const Edashinner = () => {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [categoryWiseCounts, setCategoryWiseCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState([]);
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user_id from token or localStorage
  const getUserId = () => {
    const userId = localStorage.getItem("user_id");
    if (userId) return userId;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );

        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.user_id;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  const currentUserId = getUserId();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          countsData,
          categoriesResponse,
          subcategoriesResponse,
          csCountsResponse,
          requiredDocsResponse,
          userAssignmentsResponse,
        ] = await Promise.all([
          fetch("http://72.60.206.65:3000/statistics/counts").then((res) => res.json()),
          axios.get("http://72.60.206.65:3000/categories"),
          axios.get("http://72.60.206.65:3000/subcategories"),
          axios.get("http://72.60.206.65:3000/statistics/cscounts"),
          axios.get("http://72.60.206.65:3000/required-documents"),
          axios.get(`http://72.60.206.65:3000/employee/employeeAsUser/${currentUserId}`),
        ]);

        const totalCounts = countsData.totalCounts || DEFAULT_COUNTS;
        const categoryWiseCounts = countsData.categoryWiseCounts || [];
        const categories = categoriesResponse.data || [];

        const subcategoriesObj = {};
        (subcategoriesResponse.data || []).forEach((subcategory) => {
          const categoryId = subcategory.category.category_id;
          if (!subcategoriesObj[categoryId]) {
            subcategoriesObj[categoryId] = [];
          }
          subcategoriesObj[categoryId].push(subcategory);
        });

        const categoryCounts = csCountsResponse.data?.pendingCategoryCounts || [];
        const subcategoryCounts = csCountsResponse.data?.pendingSubcategoryCounts || [];

        const requiredDocs = requiredDocsResponse.data || [];
        const userAssignedDocs = requiredDocs.filter(
          (doc) => doc.user_id === parseInt(currentUserId) || doc.user_id === currentUserId
        );

        // Compose assigned categories from user assignments response
        const userAssignments = userAssignmentsResponse.data || [];
        const userCategories = [];

        userAssignments.forEach((assignment) => {
          let categoryEntry = userCategories.find(
            (cat) => cat.category_id === assignment.category.category_id
          );
          if (!categoryEntry) {
            categoryEntry = {
              ...assignment.category,
              subcategories: subcategoriesObj[assignment.category.category_id] || [],
              assignedSubcategories: [],
            };
            userCategories.push(categoryEntry);
          }
          if (assignment.subcategory && !categoryEntry.assignedSubcategories.includes(assignment.subcategory.subcategory_id)) {
            categoryEntry.assignedSubcategories.push(assignment.subcategory.subcategory_id);
          }
        });

        setCounts(totalCounts);
        setCategoryWiseCounts(categoryWiseCounts);
        setCategories(categories);
        setSubcategoriesMap(subcategoriesObj);
        setCategoryCounts(categoryCounts);
        setSubcategoryCounts(subcategoryCounts);
        setAssignedCategories(userCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchAllData();
    } else {
      setLoading(false);
      console.error("No user ID found in token or localStorage");
    }
  }, [currentUserId, navigate]);

  const handleSubcategorySelect = (categoryId, categoryName, subcategoryId, subcategoryName) => {
    localStorage.setItem("selectedCategoryId", categoryId);
    localStorage.setItem("selectedCategoryName", categoryName);
    localStorage.setItem("selectedSubcategoryId", subcategoryId);
    localStorage.setItem("selectedSubcategoryName", subcategoryName);

    navigate("/Spage");
  };

  const getCountForCard = (cardId) => {
    if (cardId in counts) {
      return counts[cardId];
    }
    return null;
  };

  const pendingCount = counts?.documentStatus?.find(({ status }) => status === "Pending")?.count || "-";

  // Static cards
  const staticCards = [
    {
      id: "users",
      icon: FaUsers,
      title: "Users",
      color: "bg-[#FE1008]",
      linkTo: "/Userlist",
    },
    {
      id: "distributors",
      icon: FaStore,
      title: "Distributors",
      color: "bg-[#1D4ED8]",
      linkTo: "/Distributorlistonly",
    },
    {
      id: "documents",
      icon: FaFileAlt,
      title: "Documents",
      color: "bg-[#FACC15]",
      linkTo: "/Verifydocumentshistory",
    },
    {
      id: "categories",
      icon: FaCogs,
      title: "Categories",
      color: "bg-[#22C55E]",
      linkTo: null,
    },
    {
      id: "subcategories",
      icon: FaBoxes,
      title: "Subcategories",
      color: "bg-[#9333EA]",
      linkTo: null,
    },
    {
      id: "recent",
      icon: FaClipboardList,
      title: "View Recent Applications",
      color: "bg-[#F97316]",
      onClick: () => navigate("/Recentapplications"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6 ml-[350px]">
      {/* Debug user id */}
      <div className="bg-blue-100 p-2 mb-4 rounded text-xs">User ID: {currentUserId || "Not found"}</div>

      {pendingCount !== "-" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-white text-red-600 font-semibold rounded-lg shadow-xl border border-red-400 flex items-center justify-between w-[500px] z-[9999]">
          <p className="text-lg">🚨 Pending Count: {pendingCount}</p>
          <button className="text-red-600 text-xl font-bold hover:text-red-800" onClick={() => setShowPendingModal(false)}>
            &times;
          </button>
        </div>
      )}

      {/* Cards */}
      <h2 className="text-2xl font-bold mb-4">Total Counts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {staticCards.map((card) => {
          const count = getCountForCard(card.id);
          return (
            <div
              key={card.id}
              className={`${card.color} text-white flex items-center rounded-lg shadow-md transform hover:scale-105 cursor-pointer transition-transform`}
              style={{ width: "320px", height: "120px" }}
              onClick={card.onClick || (() => {})}
            >
              <div className={`${card.color} flex items-center justify-center w-1/4 h-full rounded-l-lg`}>
                <card.icon className="text-white text-5xl" />
              </div>
              <div className="w-[2px] h-3/4 bg-white opacity-70"></div>
              <div className="w-3/4 flex flex-col justify-center pl-3">
                {card.linkTo ? (
                  <Link to={card.linkTo} className="text-lg font-semibold">
                    {card.title}
                  </Link>
                ) : (
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                )}
                {count !== null && <p className="text-3xl font-bold">{count}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Card style={{ backgroundColor: "#374151", padding: "1px", marginTop: "0px" }}>
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
          <span style={{ marginRight: "15px" }}>📂</span> Your Assigned Categories and Subcategories
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
        />
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-8 w-full max-w-7xl mx-auto">
          {assignedCategories.length > 0 ? (
            assignedCategories.map((category) => {
              const categoryCount =
                categoryCounts.find((count) => count.categoryName === category.category_name)?.pendingCount || "0";

              return (
                <div key={category.category_id} className="mb-8 mt-10">
                  <div className="flex w-1/2 rounded-lg shadow-md cursor-pointer transition-all duration-300 overflow-hidden">
                    <div className="bg-orange-500 text-white p-4 flex items-center justify-center">
                      <FaCogs className="text-2xl" />
                    </div>
                    <div className="flex-1 bg-white p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{category.category_name}</h3>
                        <p className="text-sm text-gray-500">Pending: {categoryCount}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {category.subcategories.length} Subcategories
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {category.subcategories
                      .filter((subcategory) => category.assignedSubcategories.includes(subcategory.subcategory_id))
                      .map((subcategory) => {
                        const subcategoryCount =
                          subcategoryCounts.find((count) => count.subcategoryId === subcategory.subcategory_id)?.pendingCount || "0";

                        return (
                          <div
                            key={subcategory.subcategory_id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                            onClick={() =>
                              handleSubcategorySelect(
                                category.category_id,
                                category.category_name,
                                subcategory.subcategory_id,
                                subcategory.subcategory_name
                              )
                            }
                          >
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3">
                              <h4 className="text-white font-medium truncate">{subcategory.subcategory_name}</h4>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pending Tasks:</span>
                                <span className="font-bold text-orange-600">{subcategoryCount}</span>
                              </div>
                              <button className="mt-3 w-full bg-blue-100 text-blue-700 py-1 px-2 rounded text-sm hover:bg-blue-200 transition-colors">
                                View Documents
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center mt-6">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Categories Assigned</h3>
              <p className="text-gray-500">You don't have any categories assigned to you yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Edashinner;
