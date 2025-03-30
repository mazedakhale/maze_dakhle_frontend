// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://13.201.37.154:3000/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when categories are available
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategoryData = {};
        for (const category of categories) {
          const response = await fetch(
            `http://13.201.37.154:3000/subcategories/category/${category.category_id}`
          );
          if (response.ok) {
            const data = await response.json();
            subcategoryData[category.category_id] = data;
          } else {
            subcategoryData[category.category_id] = [];
          }
        }
        setSubcategories(subcategoryData);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    if (categories.length > 0) {
      fetchSubcategories();
    }
  }, [categories]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://13.201.37.154:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Decode JWT token to extract user role
      const decodedToken = jwtDecode(data.token);
      console.log("Decoded Token:", decodedToken);

      // Extract role from the decoded token
      const userRole = decodedToken.role; // Ensure this key matches your backend token structure

      // Redirect based on the role
      Swal.fire({
        title: "Login Successful!",
        text: "Redirecting to your dashboard...",
        icon: "success",
        confirmButtonColor: "#00234E",
      }).then(() => {
        if (userRole === "Customer") {
          navigate("/Cdashinner"); // Redirect to Customer Dashboard
        } else if (userRole === "Admin") {
          navigate("/Adashinner"); // Redirect to Admin Dashboard
        } else if (userRole === "Distributor") {
          navigate("/Ddashinner"); // Redirect to Distributor Dashboard
        } else if (userRole === "Employee") {
          navigate("/Edashinner"); // Redirect to Employee Dashboard
        } else {
          Swal.fire("Error", "Invalid role received", "error");
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0"
        style={{
          backgroundImage: "url('https://web.edcrib.com/updates/wp-content/uploads/2024/08/edcrib-blog1-1024x683.jpeg')",
        }}
      />

      {/* Login Form and Document List Container */}
      <div className="relative flex w-3/4 h-[75vh] bg-white bg-opacity-80 rounded-lg shadow-xl overflow-hidden gap-8 p-8">
        {/* Left Column - Login Form */}
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl text-[#1e293b] font-bold mb-4 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#F58A3B] text-white p-3 rounded hover:bg-[#F58A3B] transition"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/Registration" className="text-[#F58A3B] hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* Right Column - Dynamic Category & Subcategory List */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh] rounded-lg">
          <h2 className="text-2xl text-[#F58A3B] font-bold mb-4 text-center">
            Government Document Services
          </h2>
          <ul className="grid grid-cols-2 gap-6">
            {categories.map((category) => (
              <li key={category.category_id} className="text-gray-700 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 text-sm">⚫</span>
                  <span className="font-medium">{category.category_name}</span>
                </div>
                {/* Subcategory List */}
                {subcategories[category.category_id] && subcategories[category.category_id].length > 0 && (
                  <ul className="pl-6 mt-1 text-gray-600 text-sm list-disc">
                    {subcategories[category.category_id].map((sub) => (
                      <li key={sub.subcategory_id}>{sub.subcategory_name}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;