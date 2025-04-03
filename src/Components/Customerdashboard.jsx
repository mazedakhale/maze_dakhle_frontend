/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaClipboardList,
  FaSignOutAlt,
  FaCommentDots
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

  //import { FaTachometerAlt, FaFileAlt, FaClipboardList, FaCommentDots } from "react-icons/fa";

  return (
    <div className="w-1/5 bg-[#343A40] text-white shadow-lg p-4 min-h-screen fixed top-0 left-0 h-full">
      {/* Logo Section with Full-width Underline */}
      <div className="flex flex-col items-center mb-6 relative">
        <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
        <div className="bottom-0 left-0 w-full h-[1px] bg-[#776D6D]"></div> {/* Full-width Underline */}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul>
          {[
            { icon: <FaTachometerAlt />, label: "Dashboard", path: "/Cdashinner" },
            { icon: <FaClipboardList />, label: "Check Application", path: "/Checkapplication" },
            { icon: <FaFileAlt />, label: "Fill Form", path: "/Category" },
            { icon: <FaClipboardList />, label: "History", path: "/Customerhistory" },
            { icon: <FaClipboardList />, label: "Request History", path: "/Customererrorhistory" },
            { icon: <FaClipboardList />, label: "Applications", path: "/Customerapply" },
            { icon: <FaCommentDots />, label: "Feedback", path: "/Feedback" },
          ].map((item, index) => (
            <li
              key={index}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-4 
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

// Customer Dashboard Component
const Customerdashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false); // State to toggle email visibility

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserEmail(decodedToken.email);
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
      <div className="flex-1 p-6 ml-1/5 pt-[70px]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white text-gray px-4 py-2 shadow-[0_3px_2px_rgba(0,0,0,0.15)] fixed top-0 left-[20%] w-[80%] z-10 h-[73px]">
          <span className="text-lg font-bold">Customer Dashboard</span>

          {/* Profile & Logout */}
          <div className="flex items-center gap-4 relative">
            {/* Profile Image - Click to Show/Hide Email */}
            <img
              src="https://t4.ftcdn.net/jpg/04/83/90/95/360_F_483909569_OI4LKNeFgHwvvVju60fejLd9gj43dIcd.jpg"
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer"
              onClick={() => setShowEmail(!showEmail)}
            />

            {/* Email Display Box */}
            {showEmail && (
              <div className="absolute right-14 top-12 bg-white p-2 rounded-lg shadow-lg border border-gray-300">
                <p className="text-sm text-gray-700">{userEmail}</p>
              </div>
            )}

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

export default Customerdashboard;
