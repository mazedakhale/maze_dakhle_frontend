// src/Components/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const SMS_URL = "https://mazedakhale.in/api/sms/send";
const SMS_SENDER = "918308178738"; // your LiveOne-registered “from” number

const ResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const tokenParam = new URLSearchParams(search).get("token") || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ pw: false, cpw: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggle = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Call reset-password endpoint
      const resp = await fetch(
        "https://mazedakhale.in/api/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenParam,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
          }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Reset failed");

      // 2️⃣ Retrieve & decode your existing login JWT
      const storedToken = localStorage.getItem("token") || "";
      const { phone = "" } = storedToken ? jwtDecode(storedToken) : {};

      // 3️⃣ Normalize to E.164
      let raw = phone.replace(/^0+/, ""); // strip leading zeros
      const phoneE164 = raw.startsWith("91") ? raw : "91" + raw;

      // 4️⃣ Build SMS text
      const smsText =
        `Your Mazedakhale password has been reset successfully!\n\n` +
        `Here’s your new password:\n` +
        `${form.email}\n\n` +
        `${form.newPassword}\n\n` +
        `Please log in and consider changing it again for security.`;

      // 5️⃣ Fire-and-forget the SMS
      if (phoneE164) {
        fetch(SMS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: SMS_SENDER,
            number: phoneE164,
            message: smsText,
          }),
        }).catch((err) => console.error("SMS send error:", err));
      }

      // 6️⃣ Show success and redirect
      Swal.fire("Success", data.message, "success").then(() =>
        navigate("/login")
      );
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0"
        style={{
          backgroundImage:
            "url('https://web.edcrib.com/updates/wp-content/uploads/2024/08/edcrib-blog1-1024x683.jpeg')",
        }}
      />

      {/* Form Container */}
      <div className="relative w-full max-w-md p-8 bg-white bg-opacity-80 rounded-lg shadow-xl">
        <h2 className="text-2xl text-[#1e293b] font-bold mb-6 text-center">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="relative mb-4">
            <input
              type={show.pw ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => toggle("pw")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
            >
              {show.pw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <input
              type={show.cpw ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => toggle("cpw")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
            >
              {show.cpw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#F58A3B] text-white p-3 rounded hover:bg-[#d87730] transition"
          >
            Reset Password
          </button>
        </form>

        {/* Back to Login */}
        <p className="mt-4 text-center">
          <Link to="/login" className="text-[#F58A3B] hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
