/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaList,
  FaUserShield,
  FaFileAlt,
  FaTasks,
  FaExchangeAlt,
  FaSignOutAlt,
  FaCalendarAlt,
  FaTachometerAlt,
  FaClipboardList,
  FaCheckCircle
} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import calendar styles
import logo from "../assets/logo.png";
import jwtDecode from "jwt-decode";


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
        />
      </div>

      <nav className="mt-6">
        <ul>
          {[



            { icon: <FaTachometerAlt />, label: "Dashboard", path: "/Cdashinner" },  // Dashboard icon
            { icon: <FaTachometerAlt />, label: "Check Application", path: "/Checkapplication" },  // Dashboard icon
            { icon: <FaFileAlt />, label: "Fill Form", path: "/Category" },
            { icon: <FaFileAlt />, label: "History", path: "/Customerhistory" },
            { icon: <FaFileAlt />, label: "Request History", path: "/Customererrorhistory" },

            { icon: <FaClipboardList />, label: "Applications", path: "/customerapply" },  // Clipboard/list icon for applications
            { icon: <FaFileAlt />, label: " Feedback", path: "/Feedback" },

            // { icon: <FaCheckCircle />, label: "Status", path: "/status" },  // Check-circle icon for status updates


          ].map((item, index) => (
            <li
              key={index}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-4 shadow-md ${activePath === item.path ? "bg-white text-black border-l-4 border-blue-600" : "bg-gray-600 hover:bg-gray-400"
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
const Customerdashboard = ({ children }) => {
  const [user, setUser] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming token is stored as "user"
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        console.log("Decoded Token:", decodedToken); // Debugging
        setUserEmail(decodedToken.email); // Extract email from the token
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar onNavigate={(path) => navigate(path)} />
      <div className="flex-1 p-6">
        {/* Top Section (Navbar) */}
        <div className="flex items-center justify-between bg-[#00234E] text-white px-4 py-2 rounded-md shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[65px]">
          <span className="text-lg font-bold">Customer Dashboard</span>

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
                <div className="p-4 border-b text-center">
                  {userEmail ? (
                    <p className="text-lg bg-orange-600 text-white p-2 rounded-md">
                      <strong>{userEmail}</strong>
                    </p>
                  ) : (
                    <p className="text-lg mb-4">No user logged in.</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-32 text-3 font-bold px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 block mx-auto mb-2"
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

export default Customerdashboard;
