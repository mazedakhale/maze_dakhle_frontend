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
import MainBanner from "../assets/mainp.jpg";

const navLabels = [
  "Home",
  "Login",
  "Register",
  "ContactForm",
  "TermsAndConditions",
  "Privacy Policy",
  "RefundCancellationPolicy",
];

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
      <Link to="/">
        <img src={Logo} alt="Logo" className="h-10 w-auto shadow-md" />
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
        <Link to="/" className="bg-white text-black px-3 py-1 rounded">
          Home
        </Link>
        <Link to="/Pricing" className="bg-white text-black px-3 py-1 rounded">
          Pricing
        </Link>
        <a
          href="#"
          className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-1"
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

const PurpleBanner = () => {
  const [description, setDescription] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:3000/header")
      .then((res) =>
        setDescription(
          res.data[0]?.description || "Welcome to our website! 📞 0998766534"
        )
      )
      .catch(() => setDescription("Welcome to our website! 📞 0998766534"));
  }, []);
  return (
    <div className="bg-[#673DE6] text-white py-3 overflow-hidden mt-4">
      <div className="container mx-auto px-6">
        <marquee
          behavior="scroll"
          direction="left"
          scrollamount="4"
          className="whitespace-nowrap text-sm"
        >
          <FaBullhorn className="inline-block mr-2 text-xl" />
          {description}
        </marquee>
      </div>
    </div>
  );
};

const Footer = () => {
  const [contactInfo, setContactInfo] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:3000/contact-info")
      .then((res) => setContactInfo(res.data[0] || {}))
      .catch(() => setContactInfo(null));
  }, []);

  return (
    <footer className="bg-[#FDF6EC] pt-12 pb-8">
      <div className="container mx-auto px-6 flex flex-wrap justify-between">
        <div className="w-full md:w-1/4 mb-8 md:mb-0">
          <img src={Logo} alt="Logo" className="h-10 w-auto shadow-md" />
          <p className="text-gray-700 text-sm mt-4">
            We are committed to empowering individuals by providing easy access
            to essential government services and digital certificates.
          </p>
        </div>
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
        <div className="w-full md:w-1/4 mb-8 md:mb-0">
          <h3 className="text-gray-800 font-semibold mb-4">Stay Updated</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center">
              <FaEnvelope className="mr-2" />
              {contactInfo?.email || "..."}
            </li>
            <li className="flex items-center">
              <FaPhone className="mr-2" />
              {contactInfo?.phone || "..."}
            </li>
            <li className="flex items-center">
              <FaHome className="mr-2" />
              {contactInfo?.address || "..."}
            </li>
          </ul>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-2 bg-white rounded shadow">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 bg-white rounded shadow">
              <FaLinkedinIn />
            </a>
            <a href="#" className="p-2 bg-white rounded shadow">
              <FaTwitter />
            </a>
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <h3 className="text-gray-800 font-semibold mb-4">Download the App</h3>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-400 rounded-lg shadow-sm">
              <FaGooglePlay className="mr-2" />
              <span>Google Play</span>
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-400 rounded-lg shadow-sm">
              <FaApple className="mr-2" />
              <span>App Store</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Mainpage = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const marqueeRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/document-types")
      .then((res) => setDocumentTypes(res.data))
      .catch(() => setError("Failed to load documents"));

    axios
      .get("http://localhost:3000/news")
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
        <img src={MainBanner} alt="Main" className="w-full" />
        <div className="text-center py-10">Loading…</div>
      </div>
    );
  if (error)
    return (
      <div className="bg-gray-100">
        <Header />
        <PurpleBanner />
        <img src={MainBanner} alt="Main" className="w-full" />
        <div className="text-center py-10 text-red-600">{error}</div>
      </div>
    );

  return (
    <div className="bg-gray-100">
      <Header />
      <PurpleBanner />
      <img src={MainBanner} alt="Main" className="w-full" />

      <section className="container mx-auto mt-8 px-4">
        <div className="flex gap-6">
          <div className="w-3/5 grid grid-cols-2 gap-6">
            {documentTypes.slice(0, 4).map((doc) => {
              const Icon = iconMapping[doc.doc_type_name] || FaCertificate;
              return (
                <div
                  key={doc.doc_type_id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg"
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

          <div className="w-2/5 flex flex-col">
            <div className="bg-[#F79711] p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-white font-bold">What's New</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPlaying(false)}
                  className="bg-white text-[#F79711] px-2 py-1 rounded"
                >
                  <FaPause />
                </button>
                <button
                  onClick={() => setPlaying(true)}
                  className="bg-white text-[#F79711] px-2 py-1 rounded"
                >
                  <FaPlay />
                </button>
              </div>
            </div>
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
            <div className="bg-[#F79711] text-white text-right p-2 rounded-b-lg">
              <Link to="/news" className="font-semibold hover:underline">
                View all &gt;&gt;
              </Link>
            </div>
          </div>
        </div>

        {documentTypes.length > 4 && (
          <div className="grid grid-cols-4 gap-6 mt-6">
            {documentTypes.slice(4).map((doc) => {
              const Icon = iconMapping[doc.doc_type_name] || FaCertificate;
              return (
                <div
                  key={doc.doc_type_id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg"
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
