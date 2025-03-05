import React, { useState, useEffect } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaUsers, FaStore, FaFileAlt, FaCogs, FaBoxes, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
// Register the chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const Adashinner = () => {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [showPendingModal, setShowPendingModal] = useState(true); // State for showing the pending modal
  const navigate = useNavigate();

  const API_BASE_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories";
  const SUBCATEGORIES_API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories";
  const API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/cscounts";

  useEffect(() => {
    fetch("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/counts")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Fetch category and subcategory counts
  useEffect(() => {
    fetchCategoryAndSubcategoryCounts();
  }, []);

  const fetchCategoryAndSubcategoryCounts = async () => {
    try {
      const response = await axios.get(API_URL);
      setCategoryCounts(response.data.categoryCounts);
      setSubcategoryCounts(response.data.subcategoryCounts);
    } catch (error) {
      console.error("Error fetching category and subcategory counts:", error);
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when a category is selected
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

  // Handle subcategory selection and navigate to ElistPage
  const handleSubcategorySelect = (subcategoryId, subcategoryName) => {
    if (!selectedCategory) {
      console.error("No category selected");
      return;
    }

    const { categoryId, categoryName } = selectedCategory;

    console.log("Category ID:", categoryId);
    console.log("Category Name:", categoryName);
    console.log("Subcategory ID:", subcategoryId);
    console.log("Subcategory Name:", subcategoryName);

    navigate("/ElistPage", {
      state: { categoryId, categoryName, subcategoryId, subcategoryName },

    });
  };


  if (!data) return <p>Loading...</p>;

  const { totalCounts, dailyCounts, categoryWiseCounts } = data;

  // Pie Chart Data for Daily Document Status
  // Bar Chart for total counts (Users, Distributors, Documents, Categories, Subcategories)
  const barChartData = {
    labels: ["Users", "Distributors", "Documents", "Categories", "Subcategories"],
    datasets: [
      {
        label: "Total Counts",
        data: [
          totalCounts.users,
          totalCounts.distributors,
          totalCounts.documents,
          totalCounts.categories,
          totalCounts.subcategories,
        ],
        backgroundColor: "#36A2EB", // You can customize these colors
        borderColor: "#1D4ED8",
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart for total document status counts (Approved, Pending, etc.)
  const pieChartData = {
    labels: ["Approved", "Pending", "Rejected", "Completed"],
    datasets: [
      {
        data: [
          totalCounts.documentStatus.find(({ status }) => status === "Approved")?.count || 0,
          totalCounts.documentStatus.find(({ status }) => status === "Pending")?.count || 0,
          totalCounts.documentStatus.find(({ status }) => status === "Rejected")?.count || 0,
          totalCounts.documentStatus.find(({ status }) => status === "Completed")?.count || 0,
        ],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  // Doughnut Chart for category-wise document counts
  const doughnutChartData = {
    labels: categoryWiseCounts.map(({ categoryName }) => categoryName),
    datasets: [
      {
        label: "Category Wise Document Count",
        data: categoryWiseCounts.map(({ documentCount }) => parseInt(documentCount, 10)),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };


  const goToRecentApplications = () => {
    navigate("/Recentapplications");
  };

  const pendingCount = totalCounts.documentStatus.find(({ status }) => status === "Pending")?.count || 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6 ml-[350px]">
      {showPendingModal && (
        <div className="fixed top-15 left-1/2 transform -translate-x-1/2 p-6 bg-gray-500 text-white rounded-lg shadow-lg flex items-center justify-between w-[500px] mt-[10px]">
          <p className="text-lg font-semibold">Pending Count: {pendingCount}</p>
          <button
            className="text-white text-xl font-bold"
            onClick={() => setShowPendingModal(false)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Total Counts Cards */}
      <h2 className="text-2xl font-bold mb-4">Total Counts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Users Card */}
        <div className="w-full p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition">
          <Link to="/Userlist" className="block">
            <FaUsers className="text-4xl mb-2 mx-auto text-gray-500" />
            <h3 className="text-lg font-semibold text-center mb-2">Users</h3>
            <p className="text-center text-2xl">{totalCounts.users}</p>
          </Link>
        </div>

        <div className="w-full p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition">
          <Link to="/Distributorlistonly" className="block">
            <FaStore className="text-4xl mb-2 mx-auto text-gray-500" />
            <h3 className="text-lg font-semibold text-center mb-2">Distributors</h3>
            <p className="text-center text-2xl">{totalCounts.distributors}</p>
          </Link>
        </div>



        <div className="w-full p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition">
          <Link to="/Verifydocuments" className="block">
            <FaFileAlt className="text-4xl mb-2 mx-auto text-gray-500" />
            <h3 className="text-lg font-semibold text-center mb-2">Documents</h3>
            <p className="text-center text-2xl">{totalCounts.documents}</p>
          </Link>
        </div>




        {/* Categories Card */}
        <div className="w-full p-4 bg-white rounded shadow">
          <FaCogs className="text-4xl mb-2 mx-auto text-gray-500" />
          <h3 className="text-lg font-semibold text-center mb-2">Categories</h3>
          <p className="text-center text-2xl">{totalCounts.categories}</p>
        </div>

        {/* Subcategories Card */}
        <div className="w-full p-4 bg-white rounded shadow">
          <FaBoxes className="text-4xl mb-2 mx-auto text-gray-500" />
          <h3 className="text-lg font-semibold text-center mb-2">Subcategories</h3>
          <p className="text-center text-2xl">{totalCounts.subcategories}</p>
        </div>

        {/* Recent Applications Card */}
        <div className="w-full p-4 bg-white-500 text-black rounded shadow cursor-pointer" onClick={goToRecentApplications}>
          <FaClipboardList className="text-4xl mb-2 mx-auto" />
          <h3 className="text-lg font-semibold text-center mb-2">View Recent Applications</h3>
        </div>
      </div>

      {/* Categories & Subcategories Grid */}
      <h1>Application categories</h1>
      <div className="grid grid-cols-3 gap-4 w-full max-w-7xl mx-auto mt-4">
        {!selectedCategory ? (
          categories.map((category) => {
            const categoryCount = categoryCounts.find(
              (count) => count.categoryName === category.category_name
            )?.documentCount;

            return (
              <div
                key={category.category_id}
                className="flex flex-col items-center justify-center p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => fetchSubcategories(category.category_id, category.category_name)}
              >
                <h3 className="text-lg font-semibold">{category.category_name}</h3>
                <p className="card-text"> ({categoryCount || 0})</p>
              </div>
            );
          })
        ) : (
          subcategories.map((subcategory) => {
            const subcategoryCount = subcategoryCounts.find(
              (count) => count.subcategoryName === subcategory.subcategory_name
            )?.documentCount;

            return (
              <div
                key={subcategory.subcategory_id}
                className="flex flex-col items-center justify-center p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => handleSubcategorySelect(subcategory.subcategory_id, subcategory.subcategory_name, selectedCategory.categoryName)}
              >
                <h3 className="text-lg font-semibold">{subcategory.subcategory_name}</h3>
                <p className="card-text"> ({subcategoryCount || 0})</p>
              </div>
            );
          })
        )}
      </div>

      {/* Pie, Doughnut, and Bar Charts */}
      <div className="mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="chart-container">
            <h2 className="text-xl font-bold mb-4">Daily Document Status</h2>
            <Pie data={pieChartData} options={{ responsive: true }} />          </div>

          <div className="chart-container">
            <h2 className="text-xl font-bold mb-4">Daily Counts</h2>
            <Bar data={barChartData} options={{ responsive: true }} />          </div>
          <div className="chart-container">
            <h2 className="text-xl font-bold mb-4">Daily Category-wise Tasks</h2>
            <Doughnut data={doughnutChartData} options={{ responsive: true }} />          </div>
        </div>
      </div>
    </div>
  );
};

export default Adashinner;
