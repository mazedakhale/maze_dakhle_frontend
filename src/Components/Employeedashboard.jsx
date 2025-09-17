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
    <div className="w-1/5 bg-[#FFF3E6] fixed top-0 left-0 bottom-0 z-50 flex flex-col">
      <div className="flex flex-col h-full bg-white border-r border-gray-200 rounded-tr-xl rounded-br-xl overflow-hidden shadow-md">
        <div className="flex flex-col items-center py-6">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
        </div>

        <nav className="mt-4 px-4">
          <ul>
            {[
              {
                icon: <FaTachometerAlt />,
                label: "Dashboard",
                path: "/Edashinner",
              },
              {
                icon: <FaTachometerAlt />,
                label: "Assigned List",
                path: "/Emplist",
              },

              // { icon: <FaPlus />, label: "Add Category", path: "/Spage" },
              // { icon: <FaList />, label: "Subcategory", path: "/Addsubcategory" },
              // { icon: <FaExclamationTriangle />, label: "Error Request", path: "/Adminrequest" },
              // { icon: <FaHistory />, label: "Error Request History", path: "/Adminerrorhistory" },
              // { icon: <FaUserShield />, label: "Distributor Credentials", path: "/Distributorlist" },
              // { icon: <FaUserShield />, label: "Employee Credentials", path: "/Employeelist" },
              // { icon: <FaUserShield />, label: "Customer Credentials", path: "/Customerlist" },
              // { icon: <FaBell />, label: "Notifications", path: "/Addnotifications" },
              // { icon: <FaFileAlt />, label: "Required Documents", path: "/Requireddocuments" },
              // { icon: <FaShapes />, label: "Field Names", path: "/Addfieldname" },
              // { icon: <FaCheckCircle />, label: "Customer Request", path: "/Verifydocuments" },
              // { icon: <FaCheckCircle />, label: " Rejected  List", path: "/Rejecteddocuments" },
              // { icon: <FaCheckCircle />, label: "Verify Documents History", path: "/Verifydocumentshistory" },
              // { icon: <FaCheckCircle />, label: "Assigned Distributor List", path: "/Assigndistributorlist" },
              // { icon: <FaCheckCircle />, label: " Uploaded  List", path: "/Uploadeddocuments" },
              // { icon: <FaCheckCircle />, label: "Feedback List", path: "/FeedbackList" },
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

// Employee Dashboard Component
const Employeedashboard = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
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
      <div className="flex-1 p-6 ml-[00%] pt-[70px]">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-[#F88F2A] text-white px-4 py-2 shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[73px] rounded-md">
          <span className="text-lg font-bold">Employee Dashboard</span>

          <div className="flex items-center gap-6 relative">
            {/* Profile Icon */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowEmail(!showEmail)}
            >
              <FaRegCircleUser className="text-white" size={40} />
              {showEmail && (
                <div
                  className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white text-black p-2 rounded-md w-48 text-center shadow-lg"
                  onClick={() => navigate("/ProfilePage")}
                >
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

export default Employeedashboard;
