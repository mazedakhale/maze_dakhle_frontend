// src/NewsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaHome,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";
import Logo from "../assets/logo.png";
const navLabels = [
  "Home",
  "Login",
  "Register",
  "ContactForm",
  "TermsAndConditions",
  "Privacy Policy",
  "RefundCancellationPolicy",
];

const Header = () => (
  <header className="bg-[#F79711] py-3 shadow-md">
    <div className="container mx-auto flex justify-between items-center px-4">
      <Link to="/">
        <img
          src={Logo}
          alt="Logo"
          className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
        />
      </Link>
      <div className="hidden lg:flex items-center space-x-8 text-white">
        <div className="flex items-center space-x-2">
          <FaEnvelope />
          <span>demomazedhakale@gmail.com</span>
        </div>
        <div className="flex items-center space-x-4">
          <FaPhone />
          <span>+91 0987654321</span>
          <FaFacebookF className="cursor-pointer" />
          <FaTwitter className="cursor-pointer" />
          <FaLinkedinIn className="cursor-pointer" />
        </div>
      </div>
      <nav className="flex items-center space-x-4">
        <Link
          to="/"
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
        >
          Home
        </Link>
        <Link
          to="/Pricing"
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
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
          <button className="bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200">
            Login
          </button>
        </Link>
        <Link to="/Registration">
          <button className="bg-white text-black px-3 py-1 border rounded hover:bg-gray-50">
            Register
          </button>
        </Link>
      </nav>
    </div>
  </header>
);

// Footer
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
const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://mazedakhale.in/api/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load news");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-10 text-center">Loading…</div>
        <Footer />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-10 text-red-600 text-center">
          {error}
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      {/* breadcrumb: centered */}
      <div className="bg-gray-200 mx-6 sm:mx-6 lg:mx-10 rounded">
        <div className="max-w-4xl mx-auto px-6 py-2 text-sm text-gray-600">
          <Link to="/" className="hover:underline">
            Home
          </Link>{" "}
          &gt;&gt; What&apos;s New
        </div>
      </div>

      <main className="flex-1 bg-gray-100 flex justify-center">
        <div className="max-w-screen-lg w-full px-8 py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">What's New</h1>
          <hr className="border-gray-300 mb-6" />

          {/* make the UL inline-block so the text-center on parent actually centers it */}
          <ul className="inline-block text-left space-y-2 text-orange-600">
            {newsList.map((n) => (
              <li key={n.id} className="leading-snug">
                • {n.description}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
