import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import jwtDecode from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import axios from "axios";

//import { Grid, Card, Typography } from "@mui/material";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Ddashinner = () => {
  const [data, setData] = useState(null);
  const [distributorData, setDistributorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distributorId, setDistributorId] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();


  const API_BASE_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories";
  const SUBCATEGORIES_API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories";
  const API_URL = "https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/cscounts";


  const defaultValues = {
    totalDocuments: 0,
    dailyDocumentCount: 0,
    totalUsers: 0,
    totalCompletedCertifiedUsers: 0,
    uploaded: 0,
    rejected: 0,
    pending: 0,
  };



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

    navigate("/DlistPage", {
      state: { categoryId, categoryName, subcategoryId, subcategoryName },

    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDistributorId(decodedToken.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError('Failed to decode token');
      }
    } else {
      setError('Token not found');
    }
  }, []);

  useEffect(() => {
    if (distributorId) {
      setLoading(true);
      setError(null);
      fetch(`https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/statistics/distributor-counts/${distributorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch distributor data');
          }
          return res.json();
        })
        .then((data) => {
          setDistributorData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching distributor data:', error);
          setError('Failed to fetch distributor data');
          setLoading(false);
        });
    }
  }, [distributorId]);


  const fetchNotifications = async () => {
    try {
      const response = await axios.get('https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/notifications/active');
      const distributorNotifications = response.data.filter(
        (notif) => notif.distributor_notification && notif.notification_status === 'Active'
      );
      setNotifications(distributorNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </div>
    );
  }

  if (!distributorId || !distributorData) {
    return <div>Error: Distributor data or ID not found</div>;
  }

  // Use default values if data is missing
  const totalDocuments = distributorData?.totalDocuments || defaultValues.totalDocuments;
  const dailyDocumentCount = distributorData?.dailyDocumentCounts?.[0]?.count || defaultValues.dailyDocumentCount;
  const totalUsers = distributorData?.totalUsers || defaultValues.totalUsers;
  const totalCompletedCertifiedUsers = distributorData?.totalCompletedCertifiedUsers || defaultValues.totalCompletedCertifiedUsers;

  const statusCounts = distributorData?.statusCounts || [];
  const statusData = {
    Uploaded: 0,
    Rejected: 0,
    Pending: 0,
  };

  statusCounts.forEach(item => {
    if (item.status === "Completed") statusData.Uploaded += parseInt(item.count);
    if (item.status === "Pending") statusData.Pending += parseInt(item.count);
    if (item.status === "Rejected") statusData.Rejected += parseInt(item.count);
  });

  // Ensure dailyCompletedCertifiedUsers is an array before using .reduce()
  const dailyCompletedCertifiedUsers = Array.isArray(distributorData?.dailyCompletedCertifiedUsers)
    ? distributorData.dailyCompletedCertifiedUsers
    : [];
  // Assuming distributorData has dailyStatusCounts that has daily counts for Uploaded, Pending, and Rejected
  const dailyStatusCounts = distributorData?.statusCounts?.reduce((acc, item) => {
    if (item.status === "Completed") acc.Uploaded += parseInt(item.count);
    if (item.status === "Pending") acc.Pending += parseInt(item.count);
    if (item.status === "Rejected") acc.Rejected += parseInt(item.count);
    return acc;
  }, { Uploaded: 0, Pending: 0, Rejected: 0 });

  const dailyCertifiedCount = dailyCompletedCertifiedUsers.length > 0
    ? dailyCompletedCertifiedUsers.reduce((total, user) => total + parseInt(user.count), 0)
    : defaultValues.totalCompletedCertifiedUsers;

  const barChartData = {
    labels: ['Uploaded', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Status Counts',
      data: [
        statusData.Uploaded || 0,
        statusData.Rejected || 0,
        statusData.Pending || 0
      ],
      backgroundColor: ['green', 'red', 'orange'],
      borderColor: ['darkgreen', 'darkred', 'darkorange'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6 ml-[300px]">
      <div className="w-full max-w-7xl bg-white p-6 shadow-xl rounded-lg">

        <div style={{ backgroundColor: "#FFFF99", padding: "10px", borderRadius: "6px", marginBottom: "50px", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}>
          <marquee style={{ color: "#FF0000", fontWeight: "bold", fontSize: "16px" }}>
            {notifications.length > 0 ? notifications.map((notif) => `📢 ${notif.distributor_notification} `) : "Welcome to the Distributor Management Portal! Manage your distributors, verify documents, and track requests seamlessly!"}
          </marquee>
        </div>

        {/* 3 CONTAINERS */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} md={4}>
            <Card style={{ display: "flex", alignItems: "center", backgroundColor: "#e74c3c", color: "white", padding: "10px", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}>
              <InsertChartIcon style={{ fontSize: "40px", marginRight: "90px" }} />
              <div style={{ flexGrow: 1, marginLeft: "-75px", borderLeft: "2px solid white", paddingLeft: "10px" }}>
                <Typography variant="h6" style={{ fontSize: "16px", fontWeight: "bold" }}>Total Documents</Typography>
                <Typography variant="h4" style={{ textAlign: "right", fontWeight: "bold" }}>{totalDocuments}</Typography>
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Card style={{ display: "flex", alignItems: "center", backgroundColor: "#3498db", color: "white", padding: "10px", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}>
              <PeopleIcon style={{ fontSize: "40px", marginRight: "105px" }} />
              <div style={{ flexGrow: 1, marginLeft: "-90px", borderLeft: "2px solid white", paddingLeft: "10px" }}>
                <Typography variant="h6" style={{ fontSize: "16px", fontWeight: "bold" }}>Total Users</Typography>
                <Typography variant="h4" style={{ textAlign: "right", fontWeight: "bold" }}>{totalUsers}</Typography>
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Card style={{ display: "flex", alignItems: "center", backgroundColor: "#f1c40f", color: "white", padding: "10px", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}>
              <VerifiedUserIcon style={{ fontSize: "40px", marginRight: "75px" }} />
              <div style={{ flexGrow: 1, marginLeft: "-60px", borderLeft: "2px solid white", paddingLeft: "10px" }}>
                <Typography variant="h6" style={{ fontSize: "16px", fontWeight: "bold" }}>Total Certified Users</Typography>
                <Typography variant="h4" style={{ textAlign: "right", fontWeight: "bold" }}>{totalCompletedCertifiedUsers}</Typography>
              </div>
            </Card>
          </Grid>
        </Grid>



        {/* Application Section in a Container */}
        <Card style={{ backgroundColor: "#374151", padding: "1px", borderRadius: "8px", marginTop: "50px" }}>
          <CardContent style={{ backgroundColor: "#f97316", color: "white", fontSize: "16px", fontWeight: "600", padding: "10px", borderRadius: "6px", display: "flex", alignItems: "left", marginRight: "800px", }}>
            <span style={{ marginRight: "15px" }}>📂</span>      Application For Categories and Subcategories
          </CardContent>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#f97316", margin: "auto", transform: "rotate(45deg)", marginTop: "-6px", marginLeft: "225px" }}></div>
        </Card>



        <div className="grid grid-cols-3 gap-6 w-full max-w-7xl mx-auto mt-6">
          {!selectedCategory ? (
            categories.map((category) => {
              const categoryCount = categoryCounts.find(
                (count) => count.categoryName === category.category_name
              )?.documentCount;

              return (
                <div
                  key={category.category_id}
                  className="flex items-center bg-[#F4F4F4] shadow-lg shadow-gray-700 rounded-lg p-4 cursor-pointer transform transition hover:scale-105"
                  onClick={() => fetchSubcategories(category.category_id, category.category_name)}
                >
                  <div className="bg-orange-100 p-3 rounded-md">
                    <span className="text-orange-600 font-bold">PDF</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-semibold">{category.category_name}</h3>
                    <p className="text-sm text-gray-500">({categoryCount || 0})</p>
                  </div>
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
                  className="flex items-center bg-[#F4F4F4] shadow-lg shadow-gray-700 rounded-lg p-4 cursor-pointer transform transition hover:scale-105"
                  onClick={() => handleSubcategorySelect(subcategory.subcategory_id, subcategory.subcategory_name, selectedCategory.categoryName)}
                >
                  <div className="bg-orange-100 p-3 rounded-md">
                    <span className="text-orange-600 font-bold">PDF</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-semibold">{subcategory.subcategory_name}</h3>
                    <p className="text-sm text-gray-500">({subcategoryCount || 0})</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ paddingTop: "30px" }}>  {/* Adjust padding for spacing */}
          <Grid item xs={12} md={10} sx={{ mt: 3 }}> {/* Adds margin-top of 3 (24px) */}
            <Card>
              <CardContent>
                <Typography variant="h6">Daily Status Counts</Typography>
                <div style={{ height: "400px", width: "100%" }}>
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      devicePixelRatio: 2,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function (tooltipItem) {
                              return `${tooltipItem.label}: ${tooltipItem.raw} items`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>

        </div>





      </div>
    </div>

  );
};

export default Ddashinner;
