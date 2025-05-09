/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlus,
  FaListAlt,
  FaSignOutAlt,
  FaNewspaper,
  FaShieldAlt,
  FaUserTie,
  FaBell,
  FaFileAlt,
  FaShapes,
  FaCheckCircle,
  FaRegAddressBook,
  FaClipboardList,
  FaUserCheck,
  FaHistory,
  FaTimesCircle,
  FaFileUpload,
  FaInbox,
  FaCommentDots,
  FaYoutube,
  FaEnvelope,
  FaExclamationTriangle,
} from "react-icons/fa";

import jwtDecode from "jwt-decode";
import logo from "../assets/logo.png";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";

// Sidebar Component
const Sidebar = ({ onNavigate }) => {
  const [activePath, setActivePath] = useState("/");

  const handleNavigation = (path) => {
    setActivePath(path);
    onNavigate(path);
  };

  return (
    <div className="w-1/5 bg-[#FFF3E6] p-4 h-screen fixed top-0 left-0 overflow-y-auto scrollbar-hide flex justify-center z-50">
      {/* Sidebar Card */}
      <div className="bg-white text-black rounded-xl shadow-md border border-gray w-full min-h-max pb-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center py-6">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-4">
          <ul>
            {[
              {
                icon: <FaTachometerAlt />,
                label: "Dashboard",
                path: "/Adashinner",
              },
              { icon: <FaPlus />, label: "Add Category", path: "/Addcategory" },
              {
                icon: <FaListAlt />,
                label: "Subcategory",
                path: "/Addsubcategory",
              },
              {
                icon: <FaClipboardList />,
                label: "Add Services",
                path: "/DocumentTable",
              },
              { icon: <FaNewspaper />, label: "Add News", path: "/Newstable" },
              { icon: <FaNewspaper />, label: "Add Contact Info ", path: "/ContactinfoTable" },

              {
                icon: <FaShieldAlt />,
                label: "Add Privacy",
                path: "/PrivacyPolicyTable",
              },
              {
                icon: <FaYoutube />,
                label: "Add Youtube Link",
                path: "/Youtube",
              },
              {
                icon: <FaEnvelope />,
                label: "Add Contact Form",
                path: "/ContactTable",
              },
              {
                icon: <FaRegAddressBook />,
                label: "Users Contact Forms",
                path: "/Contact",
              },
              {
                icon: <FaExclamationTriangle />,
                label: "Error Request",
                path: "/ReceiptErrorRequests",
              },
              {
                icon: <FaUserTie />,
                label: "Distributor Credentials",
                path: "/Distributorlist",
              },
              {
                icon: <FaUserCheck />,
                label: "Employee Credentials",
                path: "/Employeelist",
              },
              { icon: <FaUserTie />, label: "Employee", path: "/Employee" },
              {
                icon: <FaUserCheck />,
                label: "Customer Credentials",
                path: "/Customerlist",
              },
              {
                icon: <FaBell />,
                label: "Notifications",
                path: "/Addnotifications",
              },
              {
                icon: <FaFileAlt />,
                label: "Required Documents",
                path: "/Requireddocuments",
              },
              { icon: <FaFileAlt />, label: "Add Price", path: "/Price" },
              {
                icon: <FaShapes />,
                label: "Field Names",
                path: "/Addfieldname",
              },
              {
                icon: <FaCheckCircle />,
                label: "Customer Request",
                path: "/Verifydocuments",
              },
              {
                icon: <FaTimesCircle />,
                label: "Rejected List",
                path: "/RejectedBefore",
              },
              {
                icon: <FaTimesCircle />,
                label: "Assigned Distributor Rejected List",
                path: "/Rejecteddocuments",
              },
              {
                icon: <FaHistory />,
                label: "Applications History",
                path: "/Verifydocumentshistory",
              },
              {
                icon: <FaUserTie />,
                label: "Assigned Distributor List",
                path: "/Assigndistributorlist",
              },
              {
                icon: <FaFileUpload />,
                label: "Uploaded List",
                path: "/Uploadeddocuments",
              },
              { icon: <FaInbox />, label: "Received List", path: "/Received" },
              {
                icon: <FaCommentDots />,
                label: "Feedback List",
                path: "/FeedbackList",
              },
            ].map((item, index) => (
              <li
                key={index}
                className={`flex items-center p-2 rounded-md cursor-pointer mb-3 transition-colors duration-200 ${activePath === item.path
                  ? "bg-orange-500 text-white"
                  : "bg-white text-black hover:bg-orange-100"
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
    </div>
  );
};

// Admin Dashboard Component
const Admindashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false); // Toggle email visibility
  const [profilePicture, setProfilePicture] = useState(null); // Add state
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserEmail(decodedToken.email);
        setUserName(decodedToken.name);
        setProfilePicture(decodedToken.profile_picture); // ✅ Extract from token
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-[00%] pt-[70px]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-[#F88F2A] text-white px-4 py-2 shadow-[0_3px_2px_rgba(0,0,0,0.15)] rounded-md fixed top-0 left-[20%] w-[80%] z-10 h-[73px]">
          <span className="text-lg font-bold text-gray-500">
            Admin Dashboard{" "}
            {userName && (
              <span className="text-sm text-gray-600 font-medium">({userName})</span>
            )}
          </span>


          {/* Right‑side controls */}
          <div className="flex items-center space-x-4">
            {/* Profile icon */}
            <img
              src={profilePicture || "https://via.placeholder.com/40x40?text=User"}
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer object-cover"
              onClick={() => navigate("/ProfilePage")}
            />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white
                          p-2 rounded-md transition flex items-center justify-center"
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
