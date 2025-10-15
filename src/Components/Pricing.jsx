// src/pages/PricingPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaGooglePlay,
  FaApple,
  FaCertificate,
  FaUserCheck,
  FaGraduationCap,
  FaUserShield,
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";

import Logo from "../assets/logo.png";

const API_CATEGORIES = "http://localhost:3000/categories";
const API_SUBCATEGORIES = "http://localhost:3000/subcategories";
const API_PRICES = "http://localhost:3000/prices";

// Footer links
const navLabels = [
  "Home",
  "Login",
  "Register",
  "ContactForm",
  "TermsAndConditions",
  "PrivacyPolicy",
  "RefundCancellationPolicy",
];

// Map category names to icons
const categoryIconMapping = {
  "Setu Dhakale": FaCertificate,
  EBC: FaUserCheck,
  PQR: FaGraduationCap,
  XYZ: FaUserShield,
};

// ——— HEADER ———
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
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          Home
        </Link>
        <Link
          to="/Pricing"
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          Pricing
        </Link>
        <a
          href="#"
          className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center space-x-1 shadow-md transition"
        >
          <FaWhatsapp />
          <span>WhatsApp</span>
        </a>
        <Link to="/Login">
          <button className="bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200 transition">
            Login
          </button>
        </Link>
        <Link to="/Registration">
          <button className="bg-white text-black px-3 py-1 border rounded hover:bg-gray-50 transition">
            Register
          </button>
        </Link>
      </nav>
    </div>
  </header>
);

// ——— FOOTER ———
const Footer = () => (
  <footer className="bg-[#FDF6EC] pt-12 pb-8">
    <div className="container mx-auto px-6 flex flex-wrap justify-between">
      <div className="w-full md:w-1/4 mb-8 md:mb-0">
        <img
          src={Logo}
          alt="Logo"
          className="h-10 w-auto shadow-[4px_4px_10px_rgba(0,0,0,0.5)]"
        />
        <p className="text-gray-700 text-sm mt-4">
          We are committed to empowering individuals by providing easy access to
          essential government services and digital certificates…
        </p>
      </div>
      <div className="w-full md:w-1/5 mb-8 md:mb-0">
        <ul className="space-y-3">
          {navLabels.map((label) => (
            <li key={label} className="flex items-center">
              <BsStopCircle className="text-gray-700 mr-2" />
              <Link
                to={label === "Home" ? "/" : `/${label}`}
                className="text-gray-700 hover:text-black"
              >
                {label.replace(/([A-Z])/g, " $1").trim()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full md:w-1/4 mb-8 md:mb-0">
        <h3 className="text-gray-800 font-semibold mb-4">Stay Updated</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center">
            <FaEnvelope className="mr-2" />
            support@sacredthemes.net
          </li>
          <li className="flex items-center">
            <FaPhone className="mr-2" />
            +1 (234) 567-9801
          </li>
          <li className="flex items-center">
            <FaPhone className="mr-2" />
            49 Unique Square D, NY 10003
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
      <div className="w-full md:w-1/4">
        <h3 className="text-gray-800 font-semibold mb-4">Download the App</h3>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-100">
            <FaGooglePlay className="mr-2" />
            Google Play
          </button>
          <button className="flex items-center px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-100">
            <FaApple className="mr-2" />
            App Store
          </button>
        </div>
      </div>
    </div>
  </footer>
);

// ——— PRICING PAGE ———
export default function PricingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [prices, setPrices] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);

  // initial load
  useEffect(() => {
    axios
      .get(API_CATEGORIES)
      .then(({ data }) => {
        setCategories(data);
        if (data.length) pickCategory(data[0]);
      })
      .catch(console.error);

    fetchPrices();
  }, []);

  // fetch price list
  const fetchPrices = async () => {
    try {
      const { data } = await axios.get(API_PRICES);
      setPrices(data.map((p) => ({ ...p, amount: Number(p.amount) })));
    } catch (e) {
      console.error(e);
    }
  };

  // select a category
  const pickCategory = (cat) => {
    setSelectedCat(cat);
    axios
      .get(API_SUBCATEGORIES)
      .then(({ data }) =>
        setSubcategories(
          data.filter((sub) => sub.category.category_id === cat.category_id)
        )
      )
      .catch(console.error);
  };

  // handle Apply click: only alert
  const handleApply = () => {
    alert("Please Login to apply.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero + Pills */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-3xl font-bold mb-2">
            Get online fast — at an unbeatable price
          </h1>
          <p className="text-gray-600 mb-8">
            Maze Dakhale — Your Trusted Partner for Online Government
            Applications
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => {
              const Icon =
                categoryIconMapping[cat.category_name] || FaCertificate;
              const active = selectedCat?.category_id === cat.category_id;
              return (
                <button
                  key={cat.category_id}
                  onClick={() => pickCategory(cat)}
                  className={`
                    px-6 py-2 rounded-full font-medium flex items-center gap-2
                    ${active ? "bg-[#FE9F13A3]" : "bg-[#FAF3E8]"}
                    text-[#2F1C6A]
                  `}
                >
                  <Icon />
                  {cat.category_name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <main className="flex-1 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subcategories.map((sub) => {
              const priceObj = prices.find(
                (p) =>
                  p.category_id === selectedCat.category_id &&
                  p.subcategory_id === sub.subcategory_id
              );
              const amount = (priceObj?.amount ?? 0).toFixed(2);
              return (
                <div
                  key={sub.subcategory_id}
                  className="border rounded-lg overflow-hidden shadow"
                >
                  <div className="bg-[#FE9F13A3] h-16 flex items-center justify-center px-2">
                    <span className="text-sm font-semibold uppercase text-[#2F1C6A] leading-tight text-center break-words">
                      {sub.subcategory_name}
                    </span>
                  </div>
                  <div className="bg-white p-6 flex flex-col items-center text-center text-[#2F1C6A]">
                    <p className="text-2xl font-bold mb-4">₹{amount}</p>
                    <button
                      onClick={handleApply}
                      className="mt-auto px-4 py-2 bg-[#F79711] text-white rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
