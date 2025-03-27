import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";
import MainBanner from "../assets/Mainpage.jpg";
import {
    FaCertificate, FaUsers, FaGraduationCap, FaUserShield, FaTractor, FaPeopleCarry,
    FaBriefcase, FaUserTimes, FaHandshake, FaUserCheck, FaIdBadge, FaHome, FaUserTie,
    FaPiggyBank, FaUserAltSlash, FaEnvelope, FaPhone, FaGooglePlay, FaApple, FaWhatsapp
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";

// Header Component
const Header = () => {
    return (
        <header className="bg-[#F79711] py-2 shadow-md">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo with Thick Shadow */}
                <div className="flex items-center">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* Contact Info */}
                <div className="hidden md:flex items-center space-x-6 text-white">
                    <div className="flex items-center space-x-2">
                        <FaEnvelope />
                        <span>demomazedhakale@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaPhone />
                        <span>+91 0987564321</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center space-x-3">
                    <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-2 shadow-md">
                        <FaWhatsapp className="text-lg" />
                        <span>WhatsApp</span>
                    </button>
                    <Link to="/Login">
                        <button className="bg-gray-100 text-black px-4 py-1 rounded-md">
                            Login
                        </button>
                    </Link>
                    <Link to="/Registration">
                        <button className="bg-white text-black px-4 py-1 border rounded-md">
                            Register
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

// Icon Mapping
const iconMapping = {
    "Adhaar": FaIdBadge,
    "Income Certificate": FaPiggyBank,
    "PAN card": FaUserTie,
    "Birth Certificate": FaCertificate,
    "Domicile": FaHome,
    "Alpabhudharak": FaUserShield,
    // Add more mappings as needed
};

// Main Page Component
const Mainpage = () => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track errors

    // Fetch document types from an API
    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const response = await fetch('http://localhost:3000/document-types');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Check if the response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response is not JSON');
                }

                const data = await response.json();

                // Ensure the data is an array
                if (Array.isArray(data)) {
                    setDocumentTypes(data); // Set the array directly
                } else if (data && Array.isArray(data.documentTypes)) {
                    setDocumentTypes(data.documentTypes); // Extract array from object
                } else {
                    console.error('Expected an array but got:', data);
                    setDocumentTypes([]); // Fallback to an empty array
                }
            } catch (error) {
                console.error('Error fetching documentTypes:', error);
                setError(error.message); // Set error message
                setDocumentTypes([]); // Fallback to an empty array
            } finally {
                setLoading(false); // Set loading to false after fetch completes
            }
        };

        fetchDocumentTypes();
    }, []);

    // Display loading state
    if (loading) {
        return <div>Loading document types...</div>;
    }

    // Display error state
    if (error) {
        return (
            <div className="text-center py-10">
                <h2 className="text-red-600 text-2xl font-semibold">Error</h2>
                <p className="text-gray-700">{error}</p>
                <p className="text-gray-500">Please try again later.</p>
            </div>
        );
    }

    // Display fallback UI if documentTypes is not an array or is empty
    if (!Array.isArray(documentTypes)) {
        return <div>Error: documentTypes is not an array.</div>;
    }

    if (documentTypes.length === 0) {
        return <div>No document types available.</div>;
    }

    return (
        <div className="bg-gray-100">
            {/* Header */}
            <Header />

            {/* Banner */}
            <div className="relative">
                <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
            </div>

            {/* Service Cards */}
            <div className="container mx-auto py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {documentTypes.map((docType) => {
                        // Get the icon component based on doc_type_name
                        const IconComponent = iconMapping[docType.doc_type_name] || FaCertificate; // Fallback to FaCertificate if no icon is found
                        return (
                            <div key={docType.doc_type_id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center">
                                <div className="text-[#F79711] text-3xl">
                                    <IconComponent /> {/* Render the dynamic icon */}
                                </div>
                                <h3 className="text-lg font-semibold mt-2">{docType.doc_type_name}</h3>
                                <p className="text-gray-600 text-sm">Register your {docType.doc_type_name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#FDF6EC] py-8">
                <div className="container mx-auto flex flex-wrap justify-between px-6">
                    {/* Left Section - Logo and Description */}
                    <div className="w-full md:w-1/3 mb-6 md:mb-0">
                        <div className="flex items-center">
                            <img src={Logo} alt="Logo" className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]" />
                        </div>
                        <p className="text-gray-700 text-sm mt-3">
                            We are committed to empowering individuals by providing easy access
                            to essential government services and digital certificates.
                        </p>
                    </div>

                    {/* Middle Section - Navigation with Icons */}
                    <div className="w-full md:w-1/4 mb-6 md:mb-0">
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to="/" className="text-gray-700 hover:text-black">Home</Link>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to="/Login" className="text-gray-700 hover:text-black">Login</Link>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to="/Registration" className="text-gray-700 hover:text-black">Register</Link>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to="/ContactForm" className="text-gray-700 hover:text-black">Contact us</Link>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to="/PrivacyPolicy" className="text-gray-700 hover:text-black">
                                    Privacy Policy
                                </Link>                            </li>
                        </ul>
                    </div>

                    {/* Right Section - App Download */}
                    <div className="w-full md:w-1/3">
                        <h3 className="text-gray-800 font-semibold mb-3">Download the App</h3>
                        <div className="flex space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-200">
                                <FaGooglePlay />
                                <span>Google Play</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-200">
                                <FaApple />
                                <span>App Store</span>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Mainpage;