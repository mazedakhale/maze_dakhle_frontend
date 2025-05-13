import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Ensure Tailwind & CSS are imported
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle input changes and set the form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) newErrors.name = "Name is required.";

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits.";
    }

    // Address, City, and Country validation
    if (!formData.address) newErrors.address = "Address is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.country) newErrors.country = "Country is required.";

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    const formErrors = validateForm();

    // If errors exist, don't proceed with the submission
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const userData = {
      ...formData,
      role: "Distributor", // Automatically set role as Distributor
      user_login_status: "Approve", // Default status for Distributors
    };

    try {
      const response = await fetch(
        "https://mazedakhale.in/api/users/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful!");
        navigate("/Distributorlist"); // Redirect
      } else {
        alert(`Registration Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="ml-[260px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      <div className="w-full p-6">
        {/* Main Container */}
        <div className="w-full max-w-7xl bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Feild Name
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto mt-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.name}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.email}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.password}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.phone}
              pattern="\d{10}"
              maxLength="10"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}

            <input
              type="text"
              name="address"
              placeholder="Address"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.address}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}

            <input
              type="text"
              name="city"
              placeholder="City"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.city}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}

            <input
              type="text"
              name="country"
              placeholder="Country"
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.country}
            />
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#00234E] hover:bg-[#1e293b] text-white py-2 rounded"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
