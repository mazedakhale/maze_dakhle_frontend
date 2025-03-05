/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaUserShield, FaClockRotateLeft, FaUserCheck, FaFileSignature } from "react-icons/fa6";
import jwtDecode from "jwt-decode";
import logo from "../assets/logo.png";
 
// Sidebar Component
const Sidebar = ({ activePath, onNavigate }) => {
    const menuItems = [
        { icon: <FaChartLine />, label: "Dashboard", path: "/Ddashinner" }, // Trendy Dashboard Icon
        { icon: <FaUserShield />, label: "Distributor Verify", path: "/Distributorverify" }, // Secure User Verification Icon
        { icon: <FaClockRotateLeft />, label: "Verify History", path: "/Distributorverifyhistory" }, // History with Clock Icon
        { icon: <FaUserCheck />, label: "Distributor Request", path: "/Distributorrequest" }, // User Approval Icon
        { icon: <FaFileSignature />, label: "Request History", path: "/Distributorhistory" }, // Document Signing Icon
    ];
    

    return (
        <div className="w-1/5 bg-[#343A40] text-white shadow-lg p-4 min-h-screen fixed top-0 left-0 h-full">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-6 shadow-md">
                <img src={logo} alt="Logo" className="h-10 w-auto mb-2 " />
            </div>

            {/* Navigation Menu */}
            <nav className="mt-6">
                <ul>
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-4 shadow-md 
                            ${activePath === item.path ? "bg-white text-black border-l-4 border-blue-600" : "bg-gray-600 hover:bg-orange-400"}`}
                            onClick={() => onNavigate(item.path)}
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

// Distributor Dashboard Component
const Distributordashboard = ({ children }) => {
    const [userEmail, setUserEmail] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
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
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            {/* Sidebar */}
            <Sidebar activePath="/" onNavigate={navigate} />

            {/* Main Content */}
            <div className="flex-1 p-6 ml-1/5 pt-[70px]">
                {/* Top Section */}
                <div className="flex items-center justify-between bg-white text-black px-4 py-2 shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[65px]">
                    {/* Logo & Dashboard Title */}
                    <div className="flex items-center">
                        {/* <img src={logo} alt="Logo" className="h-10 w-auto mr-3" /> */}
                        <span className="text-lg font-bold">Distributor Dashboard</span>
                    </div>

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

                {/* Render children */}
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
};

export default Distributordashboard;
