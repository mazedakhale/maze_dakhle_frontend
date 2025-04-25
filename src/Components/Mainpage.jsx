import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBullhorn } from "react-icons/fa";  // ← make sure this is imported

import Logo from "../assets/logo.png";
import MainBanner from "../assets/Mainpage.jpg";

import {
    FaCertificate,
    FaUsers,
    FaGraduationCap,
    FaUserShield,
    FaTractor,
    FaPeopleCarry,
    FaBriefcase,
    FaUserTimes,
    FaHandshake,
    FaUserCheck,
    FaIdBadge,
    FaHome,
    FaUserTie,
    FaPiggyBank,
    FaUserAltSlash,
    FaEnvelope,
    FaPhone,
    FaWhatsapp,
    FaGooglePlay,
    FaApple,
    FaFacebookF,
    FaLinkedinIn,
    FaTwitter,
    FaBell,             // ← notification bell icon
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";

// Navigation labels for footer
const navLabels = [
    "Home",
    "Login",
    "Register",
    "ContactForm",
    "TermsAndConditions",
    "Privacy Policy",
    "RefundCancellationPolicy",
];

// Icon mapping for document types
const iconMapping = {
    Adhaar: FaIdBadge,
    "Income Certificate": FaPiggyBank,
    "PAN card": FaUserTie,
    "Birth Certificate": FaCertificate,
    Domicile: FaHome,
    Alpabhudharak: FaUserShield,
};

// Header Component
const Header = () => (
    <header className="bg-[#F79711] py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
            {/* Logo */}
            <Link to="/">
                <img
                    src={Logo}
                    alt="Logo"
                    className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
                />
            </Link>

            {/* Contact Info */}
            <div className="hidden lg:flex items-center space-x-8 text-white">
                <div className="flex items-center space-x-2">
                    <FaEnvelope />
                    <span>demomazedhakale@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                    <FaPhone />
                    <span>+91 0987654321</span>
                </div>
            </div>

            {/* Navigation & Actions */}
            <nav className="flex items-center space-x-4">
                <Link
                    to="/"
                    className="text-black px-3 py-1 hover:bg-white bg-white hover:text-black rounded"
                >
                    Home
                </Link>
                <Link
                    to="/Pricing"
                    className="text-black px-3 py-1 hover:bg-white bg-white hover:text-black rounded"
                >
                    Pricing
                </Link>
                <a
                    href="#"
                    className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-1 shadow-md"
                >
                    <FaWhatsapp />
                    <span>WhatsApp</span>
                </a>
                <Link to="/Login">
                    <button className="bg-gray-100 text-black px-3 py-1 rounded">
                        Login
                    </button>
                </Link>
                <Link to="/Registration">
                    <button className="bg-white text-black px-3 py-1 border rounded">
                        Register
                    </button>
                </Link>
            </nav>
        </div>
    </header>
);

// Purple marquee banner with bell icon

// at the top with your other imports

// Purple marquee banner with megaphone icon inside the scroll
const PurpleBanner = () => (
    <div className="bg-[#673DE6] text-white py-3 mt-4 overflow-hidden">
        <div className="container mx-auto px-6">
            <marquee
                behavior="scroll"
                direction="left"
                scrollamount="4"
                className="whitespace-nowrap text-sm"
            >
                <FaBullhorn className="inline-block mr-2 text-xl" />
                हमारी वेबसाइट पर आप सभी यूज़र्स का स्वागत है । हम सभी यूज़र्स को बेहतरीन
                सर्विस प्रोवाइड करते हैं । हमसे जुड़ने के लिए धन्यवाद । 📞 0998766534 ।
                हमारी ट्रेनिंग वीडियो देखने के लिए नीचे क्लिक करें…                &nbsp;&nbsp;&nbsp;&nbsp;
                <FaBullhorn className="inline-block mr-2 text-xl" />
                हमारी वेबसाइट पर आप सभी यूज़र्स का स्वागत है । हम सभी यूज़र्स को बेहतरीन
                सर्विस प्रोवाइड करते हैं । हमसे जुड़ने के लिए धन्यवाद । 📞 0998766534 ।
                हमारी ट्रेनिंग वीडियो देखने के लिए नीचे क्लिक करें…
                <FaBullhorn className="inline-block mr-2 text-xl" />
                हमारी वेबसाइट पर आप सभी यूज़र्स का स्वागत है । हम सभी यूज़र्स को बेहतरीन
                सर्विस प्रोवाइड करते हैं । हमसे जुड़ने के लिए धन्यवाद । 📞 0998766534 ।
                हमारी ट्रेनिंग वीडियो देखने के लिए नीचे क्लिक करें…       </marquee>
        </div>
    </div>
);


// Footer Component
const Footer = () => (
    <footer className="bg-[#FDF6EC] pt-12 pb-8">
        <div className="container mx-auto px-6 flex flex-wrap justify-between">
            {/* 1. About */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
                <img
                    src={Logo}
                    alt="Logo"
                    className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
                />
                <p className="text-gray-700 text-sm mt-4">
                    We are committed to empowering individuals by providing easy access to
                    essential government services and digital certificates. Our platform
                    simplifies the registration process for community certificates,
                    nativity certificates, income certificates, and more, ensuring a
                    seamless and efficient experience for all users.
                </p>
            </div>

            {/* 2. Navigation */}
            <div className="w-full md:w-1/5 mb-8 md:mb-0">
                <ul className="space-y-3">
                    {navLabels.map((label) => (
                        <li key={label} className="flex items-center">
                            <BsStopCircle className="text-gray-700 mr-2" />
                            <Link
                                to={label === "Home" ? "/" : `/${label.replace(/\s+/g, "")}`}
                                className="text-gray-700 hover:text-black"
                            >
                                {label.replace(/([A-Z])/g, " $1").trim()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 3. Stay Updated */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
                <h3 className="text-gray-800 font-semibold mb-4">Stay Updated</h3>
                <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                        <FaEnvelope className="mr-2" />
                        <span>support@sacredthemes.net</span>
                    </li>
                    <li className="flex items-center">
                        <FaPhone className="mr-2" />
                        <span>+1 (234) 567-9801</span>
                    </li>
                    <li className="flex items-center">
                        <FaHome className="mr-2" />
                        <span>49 Unique Square D, New York, NY 10003, USA</span>
                    </li>
                </ul>
                <div className="flex space-x-4 mt-4">
                    <a href="#" className="p-2 bg-white rounded shadow hover:bg-gray-100">
                        <FaFacebookF />
                    </a>
                    <a href="#" className="p-2 bg-white rounded shadow hover:bg-gray-100">
                        <FaLinkedinIn />
                    </a>
                    <a href="#" className="p-2 bg-white rounded shadow hover:bg-gray-100">
                        <FaTwitter />
                    </a>
                </div>
            </div>

            {/* 4. Download the App */}
            <div className="w-full md:w-1/4">
                <h3 className="text-gray-800 font-semibold mb-4">Download the App</h3>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-400 rounded-lg shadow-sm hover:bg-gray-100">
                        <FaGooglePlay className="mr-2" />
                        <span>Google Play</span>
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-400 rounded-lg shadow-sm hover:bg-gray-100">
                        <FaApple className="mr-2" />
                        <span>App Store</span>
                    </button>
                </div>
            </div>
        </div>
    </footer>
);

// Mainpage Component
const Mainpage = () => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch document types
    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const res = await fetch("https://mazedakhale.in/api/document-types");
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const contentType = res.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    throw new Error("Server did not return JSON");
                }
                const data = await res.json();
                setDocumentTypes(
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data.documentTypes)
                            ? data.documentTypes
                            : []
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDocumentTypes();
    }, []);

    // Fetch and filter feedbacks
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const { data } = await axios.get("https://mazedakhale.in/api/feedback");
                let arr = Array.isArray(data)
                    ? data
                    : Array.isArray(data.feedbacks)
                        ? data.feedbacks
                        : Array.isArray(data.data)
                            ? data.data
                            : [];
                const normalized = arr.map((fb) => ({
                    ...fb,
                    status: fb.feedback_status ?? fb.status,
                }));
                setFeedbacks(normalized.filter((fb) => fb.status === 1));
            } catch {
                setError("Failed to load feedbacks");
            }
        };
        fetchFeedbacks();
    }, []);

    if (loading)
        return (
            <div className="bg-gray-100">
                <Header />
                <PurpleBanner />
                <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
                <div className="container mx-auto py-10 text-center">Loading…</div>
            </div>
        );

    if (error)
        return (
            <div className="bg-gray-100">
                <Header />
                <PurpleBanner />
                <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
                <div className="container mx-auto py-10 text-center">
                    <h2 className="text-red-600 text-2xl font-semibold">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );

    return (
        <div className="bg-gray-100">
            <Header />
            <PurpleBanner />
            <img src={MainBanner} alt="Maze Dakhale" className="w-full" />

            {/* Document Type Cards */}
            {documentTypes.length > 0 && (
                <div className="container mx-auto py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documentTypes.map((doc) => {
                            const Icon = iconMapping[doc.doc_type_name] || FaCertificate;
                            return (
                                <div
                                    key={doc.doc_type_id}
                                    className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center"
                                >
                                    <Icon className="text-[#F79711] text-3xl" />
                                    <h3 className="text-lg font-semibold mt-2">
                                        {doc.doc_type_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Register your {doc.doc_type_name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Feedback Section */}
            {feedbacks.length > 0 && (
                <section className="container mx-auto py-10">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        What People Are Saying
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {feedbacks.map((fb) => (
                            <blockquote
                                key={fb.feedback_feedback_id}
                                className="bg-white p-6 rounded-lg shadow-lg border"
                            >
                                <p className="text-gray-800 italic mb-4">
                                    “{fb.feedback_comment}”
                                </p>
                                <footer className="text-right text-sm font-semibold text-gray-600">
                                    — {fb.users_name || "Anonymous"}
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default Mainpage;
