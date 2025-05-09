/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUserShield,
  FaClockRotateLeft,
  FaUserCheck,
  FaFileSignature,
} from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { FaRegCircleUser } from "react-icons/fa6";
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
    <div className="w-1/5 bg-[#FFF3E6] p-4 min-h-screen fixed top-0 left-0 overflow-y-auto z-50">
      <div className="bg-white text-black rounded-xl shadow-md border border-gray w-full min-h-max pb-10">
        <div className="flex flex-col items-center py-6">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
        </div>

        <nav className="mt-4 px-4">
          <ul>
            {[
              {
                icon: <FaChartLine />,
                label: "Dashboard",
                path: "/Ddashinner",
              },
              {
                icon: <FaUserShield />,
                label: "Distributor Verify",
                path: "/Distributorverify",
              },
              {
                icon: <FaClockRotateLeft />,
                label: "Verify History",
                path: "/Distributorverifyhistory",
              },
              {
                icon: <FaClockRotateLeft />,
                label: "Sent History",
                path: "/Dsentlist",
              },
              {
                icon: <FaClockRotateLeft />,
                label: "Rejected History",
                path: "/Distributorrejected",
              },
              {
                icon: <FaUserCheck />,
                label: "Distributor Request",
                path: "/Distributorrequest",
              },
              {
                icon: <FaFileSignature />,
                label: "Feedback",
                path: "/FeedbackD",
              },
            ].map((item, index) => (
              <li
                key={index}
                className={`flex items-center p-2 rounded-md cursor-pointer mb-3 transition-colors duration-200 ${
                  activePath === item.path
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

// Distributor Dashboard Component
const Distributordashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex-1 p-6 ml-1/5 pt-[70px]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-[#F88F2A] text-white px-4 py-2 shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[73px] rounded-md">
          <span className="text-lg font-bold">Distributor Dashboard</span>

          <div className="flex items-center gap-6 relative">
            {/* Profile Icon */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowEmail(!showEmail)}
            >
              <FaRegCircleUser className="text-white" size={40} />
              {showEmail && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white text-black p-2 rounded-md w-48 text-center shadow-lg">
                  {userEmail}
                </div>
              )}
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="p-0 m-0">
              <IoMdLogOut className="text-white" size={40} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Distributordashboard;
