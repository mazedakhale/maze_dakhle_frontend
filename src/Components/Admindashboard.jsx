/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlus,
  FaList,
  FaUserShield,
  FaFileAlt,
  FaExclamationTriangle,
  FaHistory,
  FaBell,
  FaShapes,
  FaCheckCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import jwtDecode from "jwt-decode";
import logo from "../assets/logo.png";

// Sidebar Component
const Sidebar = ({ onNavigate }) => {
  const [activePath, setActivePath] = useState("/");

  const handleNavigation = (path) => {
    setActivePath(path);
    onNavigate(path);
  };

  return (
    <div className="w-1/5 bg-[#343A40] text-white shadow-lg p-4 h-screen fixed top-0 left-0 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      {/* Logo Section with Full-width Underline */}
      <div className="flex flex-col items-center mb-6 relative">
        <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
        <div className="bottom-0 left-0 w-full h-[1px] bg-[#776D6D]"></div> {/* Full-width Underline */}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul>
          {[
            { icon: <FaTachometerAlt />, label: "Dashboard", path: "/Adashinner" },
            { icon: <FaPlus />, label: "Add Category", path: "/Addcategory" },
            { icon: <FaList />, label: "Subcategory", path: "/Addsubcategory" },
            { icon: <FaList />, label: "Add Services", path: "/DocumentTable " },
            { icon: <FaList />, label: "Add Privacy", path: "/PrivacyPolicyTable " },
            { icon: <FaList />, label: "Add Youtube Link", path: "/Youtube " },

            { icon: <FaList />, label: "Add Contact Form", path: "/ContactTable " },
            { icon: <FaList />, label: "Users Contact  Forms ", path: "/Contact " },


            // { icon: <FaExclamationTriangle />, label: " Certificate Error Request", path: "/Adminrequest" },
            { icon: <FaExclamationTriangle />, label: "  Error Request", path: "/ReceiptErrorRequests" },

            // { icon: <FaHistory />, label: "Error Request History", path: "/Adminerrorhistory" },
            { icon: <FaUserShield />, label: "Distributor Credentials", path: "/Distributorlist" },
            { icon: <FaUserShield />, label: "Employee Credentials", path: "/Employeelist" },
            { icon: <FaUserShield />, label: "Employee ", path: "/Employee" },

            { icon: <FaUserShield />, label: "Customer Credentials", path: "/Customerlist" },
            { icon: <FaBell />, label: "Notifications", path: "/Addnotifications" },
            { icon: <FaFileAlt />, label: "Required Documents", path: "/Requireddocuments" },
            { icon: <FaFileAlt />, label: "Add Price", path: "/PriceTable" },

            { icon: <FaShapes />, label: "Field Names", path: "/Addfieldname" },
            { icon: <FaCheckCircle />, label: "Customer Request", path: "/Verifydocuments" },
            { icon: <FaCheckCircle />, label: " Rejected  List", path: "/RejectedBefore" },

            { icon: <FaCheckCircle />, label: " Assigned Distributor Rejected  List", path: "/Rejecteddocuments" },


            { icon: <FaCheckCircle />, label: "Applications History", path: "/Verifydocumentshistory" },
            { icon: <FaCheckCircle />, label: "Assigned Distributor List", path: "/Assigndistributorlist" },
            { icon: <FaCheckCircle />, label: " Uploaded  List", path: "/Uploadeddocuments" },
            { icon: <FaCheckCircle />, label: " Received  List", path: "/Received" },

            { icon: <FaCheckCircle />, label: "Feedback List", path: "/FeedbackList" },
          ].map((item, index) => (
            <li
              key={index}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-4 
              shadow-lg border border-[#111] ${activePath === item.path
                  ? "bg-orange-500 text-white"
                  : "bg-[#494E53] hover:bg-orange-400"
                }`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Admin Dashboard Component
const Admindashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false); // Toggle email visibility

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserEmail(decodedToken.email || "No email found");
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/Login";
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-[00%] pt-[70px]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white text-gray px-4 py-2 shadow-[0_3px_2px_rgba(0,0,0,0.15)] fixed top-0 left-[20%] w-[80%] z-10 h-[73px]">          <span className="text-lg font-bold">Admin Dashboard</span>

          {/* Profile & Logout Section */}

          {/* Profile & Logout */}
          <div className="flex items-center gap-4 relative">
            {/* Profile Image with Email Toggle */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowEmail(!showEmail)}
            >
              <img
                src="https://t4.ftcdn.net/jpg/04/83/90/95/360_F_483909569_OI4LKNeFgHwvvVju60fejLd9gj43dIcd.jpg"
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
              {/* Email Display Dropdown */}
              {showEmail && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-md text-black p-2 rounded-md w-48 text-center">
                  {userEmail || "No Email Found"}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md transition flex items-center justify-center"
            >
              <FaSignOutAlt className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Admindashboard;
