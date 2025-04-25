import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
    FaGooglePlay,
    FaApple,
    FaWhatsapp,
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";

// Header Component
const Header = () => (
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

// Icon Mapping for document types
const iconMapping = {
    Adhaar: FaIdBadge,
    "Income Certificate": FaPiggyBank,
    "PAN card": FaUserTie,
    "Birth Certificate": FaCertificate,
    Domicile: FaHome,
    Alpabhudharak: FaUserShield,
};

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

    // Fetch and filter feedbacks (only status === 1)
    // Fetch and filter feedbacks (only status === 1)
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await axios.get("https://mazedakhale.in/api/feedback");
                let arr = [];
                if (Array.isArray(res.data)) arr = res.data;
                else if (Array.isArray(res.data.feedbacks)) arr = res.data.feedbacks;
                else if (Array.isArray(res.data.data)) arr = res.data.data;

                // Normalize the status field (handles both feedback_status and status)
                const normalized = arr.map(fb => ({
                    ...fb,
                    status: fb.feedback_status ?? fb.status
                }));

                // Keep only feedbacks with status === 1
                const filtered = normalized.filter(fb => fb.status === 1);
                setFeedbacks(filtered);
            } catch (err) {
                console.error(err);
                setError("Failed to load feedbacks");
            }
        };
        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-100">
                <Header />
                <div className="relative">
                    <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
                </div>
                <div className="container mx-auto py-10 text-center">
                    <p>Loading…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100">
                <Header />
                <div className="relative">
                    <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
                </div>
                <div className="container mx-auto py-10 text-center">
                    <h2 className="text-red-600 text-2xl font-semibold">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100">
            <Header />

            <div className="relative">
                <img src={MainBanner} alt="Maze Dakhale" className="w-full" />
            </div>

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
                                    <div className="text-[#F79711] text-3xl">
                                        <Icon />
                                    </div>
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

            {/* Feedback Section (status === 1 only) */}
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

// Footer Component
const Footer = () => (
    <footer className="bg-[#FDF6EC] py-8">
        <div className="container mx-auto flex flex-wrap justify-between px-6">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
                <div className="flex items-center">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
                    />
                </div>
                <p className="text-gray-700 text-sm mt-3">
                    We are committed to empowering individuals by providing easy access to
                    essential government services and digital certificates.
                </p>
            </div>

            <div className="w-full md:w-1/4 mb-6 md:mb-0">
                <ul className="space-y-3">
                    {["Home", "Login", "Register", "ContactForm", , "TermsAndConditions", "Privacy Policy", "RefundCancellationPolicy",].map(
                        (label) => (
                            <li key={label} className="flex items-center space-x-2">
                                <BsStopCircle className="text-gray-700 text-xl" />
                                <Link to={label === "Home" ? "/" : `/${label.replace(" ", "")}`}>
                                    <span className="text-gray-700 hover:text-black">{label}</span>
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </div>

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
);

export default Mainpage;
