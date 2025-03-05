/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
  FaPlus,
  FaList,
  FaUserShield,
  FaFileAlt,
  FaTasks,
  FaExchangeAlt, FaTachometerAlt, FaExclamationTriangle, FaHistory, FaBell, FaFileUpload, FaShapes, FaCheckCircle
} from "react-icons/fa";


import logo from "../assets/logo.png";

const Sidebar = ({ onNavigate }) => {
  const [activePath, setActivePath] = useState("/");

  const handleNavigation = (path) => {
    setActivePath(path);
    onNavigate(path);
  };

  return (
    <div className="w-1/5 bg-[#00234E] text-white shadow-lg p-4 min-h-screen fixed top-0 left-0 h-full">
      <div className="flex flex-col items-center mb-6">
        <img
          src={logo}
          alt="Logo"
          className="[h-10px] w-[200px] mb-2"
        />      </div>


      <div className="mt-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <nav>
          <ul>
            {[
              { icon: <FaTachometerAlt />, label: "Dashboard", path: "/Adashinner" }, // Dashboard Icon
              { icon: <FaPlus />, label: "Add Category", path: "/Addcategory" }, // Plus Icon
              { icon: <FaList />, label: "Subcategory", path: "/Addsubcategory" }, // List Icon
              { icon: <FaExclamationTriangle />, label: "Error Request", path: "/Adminrequest" }, // Error Icon
              { icon: <FaHistory />, label: "Error Request History", path: "/Adminerrorhistory" }, // History Icon
              { icon: <FaUserShield />, label: "Distributor Credentials", path: "/distributorlist" }, // Shield User Icon
              { icon: <FaUserShield />, label: "Customer Credentials", path: "/Customerlist" },
              { icon: <FaBell />, label: "Notifications", path: "/Addnotifications" }, // Notification Bell
              { icon: <FaFileAlt />, label: "Required Documents", path: "/requireddocuments" }, // Document Icon
              // { icon: <FaFileUpload />, label: "Add Services", path: "/documenttable" }, // Upload File Icon
              { icon: <FaShapes />, label: "Field Names", path: "/Addfieldname" }, // Shapes Icon (for fields)
              { icon: <FaExchangeAlt />, label: "Transaction", path: "/transactions" }, // Exchange Icon
              { icon: <FaCheckCircle />, label: "Verify Documents", path: "/Verifydocuments" }, // Check Circle (Verification)
              { icon: <FaCheckCircle />, label: "Verify Documents History", path: "/Verifydocumentshistory" },
              { icon: <FaCheckCircle />, label: " Assigned Distributor List", path: "/AssignedDistributorsList" },
              { icon: <FaCheckCircle />, label: "   Feedback List", path: "/FeedbackList" },



            ].map((item, index) => (
              <li
                key={index}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-2 shadow-md ${activePath === item.path
                    ? "bg-white text-black border-l-4 border-blue-600"
                    : "bg-gray-600 hover:bg-gray-400"
                  }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
      </div>

    </div>
  );
};

const AdminDashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserEmail = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUserEmail(decodedToken.email || "No email found"); // Extract email
        } catch (error) {
          console.error("Invalid token:", error);
          setUserEmail(""); // Reset if decoding fails
        }
      }
    };

    fetchUserEmail();
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.clear();

    // Reset states
    setUserEmail("");
    setDropdownOpen(false);

    // Navigate to login page
    navigate("/");
  };


  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar onNavigate={(path) => navigate(path)} />
      <div className="flex-1 p-4">
        {/* Top Section */}
        <div className="flex items-center justify-between bg-[#00234E] text-white px-4 py-2 rounded-md shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[65px]">
          <span className="text-lg font-bold">Admin Dashboard</span>

          {/* Profile Section */}
          <div className="relative">
            <img
              src="https://t4.ftcdn.net/jpg/04/83/90/95/360_F_483909569_OI4LKNeFgHwvvVju60fejLd9gj43dIcd.jpg"
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                <div className="p-4 border-b">
                  <p className="text-lg text-black mb-4"><strong>{userEmail || "No user logged in"}</strong></p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>

            )}
          </div>
        </div>
        {/* Render children here */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;

