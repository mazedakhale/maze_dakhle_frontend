import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCertificate,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaGooglePlay,
  FaApple,
  FaBullhorn,
  FaPause,
  FaPlay,
  FaIdBadge,
  FaHome,
  FaUserTie,
  FaPiggyBank,
  FaUserShield,
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { BsStopCircle } from "react-icons/bs";

import Logo from "../assets/logo.png";
import MainBanner from "../assets/Mainpage.jpg";

// Footer nav labels
const navLabels = [
  "Home",
  "Login",
  "Register",
  "ContactForm",
  "TermsAndConditions",
  "Privacy Policy",
  "RefundCancellationPolicy",
];

// Icon map
const iconMapping = {
  Adhaar: FaIdBadge,
  "Income Certificate": FaPiggyBank,
  "PAN card": FaUserTie,
  "Birth Certificate": FaCertificate,
  Domicile: FaHome,
  Alpabhudharak: FaUserShield,
};

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
        <div className="flex items-center space-x-4">
          <FaPhone />
          <span>+91 0987654321</span>
          <FaFacebookF className="cursor-pointer" />
          <FaTwitter className="cursor-pointer" />
          <FaLinkedinIn className="cursor-pointer" />
        </div>
      </div>

      {/* Navigation & Actions */}
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

// Purple marquee
const PurpleBanner = () => (
  <div className="bg-[#673DE6] text-white py-3 overflow-hidden mt-4">
    <div className="container mx-auto px-6">
      <marquee
        behavior="scroll"
        direction="left"
        scrollamount="4"
        className="whitespace-nowrap text-sm"
      >
        <FaBullhorn className="inline-block mr-2 text-xl" />
        हमारी वेबसाइट पर आप सभी यूज़र्स का स्वागत है… 📞 0998766534 …
      </marquee>
    </div>
  </div>
);

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

const Mainpage = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const marqueeRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    fetch("https://mazedakhale.in/api/document-types")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) =>
        setDocumentTypes(
          Array.isArray(data)
            ? data
            : Array.isArray(data.documentTypes)
            ? data.documentTypes
            : []
        )
      )
      .catch(() => setError("Failed to load documents"));

    axios
      .get("https://mazedakhale.in/api/news")
      .then((res) => setNewsList(res.data))
      .catch(() => setError("Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!marqueeRef.current) return;
    playing ? marqueeRef.current.start() : marqueeRef.current.stop();
  }, [playing]);

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
        <div className="container mx-auto py-10 text-center text-red-600">
          {error}
        </div>
      </div>
    );

  return (
    <div className="bg-gray-100">
      <Header />
      <PurpleBanner />
      <img src={MainBanner} alt="Maze Dakhale" className="w-full" />

      {/* Certificates + What's New */}
      <section className="container mx-auto mt-8 px-4">
        <div className="flex gap-6">
          {/* LEFT: 60% width for first four cards */}
          <div className="w-3/5 grid grid-cols-2 grid-rows-2 gap-6">
            {documentTypes.slice(0, 4).map((doc) => {
              const Icon = iconMapping[doc.doc_type_name] || FaCertificate;
              return (
                <div
                  key={doc.doc_type_id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <Icon className="text-[#F79711] text-3xl mb-2" />
                  <h3 className="text-lg font-semibold">{doc.doc_type_name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Register your {doc.doc_type_name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT: 40% width for What's New panel */}
          <div className="w-2/5 flex flex-col">
            {/* Header now Orange */}
            <div className="bg-[#F79711] p-4 rounded-t-lg shadow flex justify-between items-center">
              <h3 className="text-white font-bold">What's New</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPlaying(false)}
                  className="p-1 bg-white text-[#F79711] rounded hover:bg-gray-200"
                >
                  <FaPause />
                </button>
                <button
                  onClick={() => setPlaying(true)}
                  className="p-1 bg-white text-[#F79711] rounded hover:bg-gray-200"
                >
                  <FaPlay />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 bg-[#F79711]/10 p-4 overflow-y-auto">
              <marquee
                ref={marqueeRef}
                direction="up"
                scrollamount="1"
                className="space-y-2 text-gray-800 text-sm"
              >
                {newsList.slice(0, 5).map((n) => (
                  <div key={n.id}>• {n.description}</div>
                ))}
              </marquee>
            </div>

            {/* Footer */}
            <div className="bg-[#F79711] text-white text-right p-2 rounded-b-lg">
              <Link to="/news" className="font-semibold hover:underline">
                View all &gt;&gt;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row: remaining certificates */}
        {documentTypes.length > 4 && (
          <div className="grid grid-cols-4 gap-6 mt-6">
            {documentTypes.slice(4).map((doc) => {
              const Icon = iconMapping[doc.doc_type_name] || FaCertificate;
              return (
                <div
                  key={doc.doc_type_id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <Icon className="text-[#F79711] text-3xl mb-2" />
                  <h3 className="text-lg font-semibold">{doc.doc_type_name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Register your {doc.doc_type_name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Mainpage;
