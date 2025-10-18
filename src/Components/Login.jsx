import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();
  // src/pages/Login.jsx
  const SMS_URL = "/api/sms/send";
  const SMS_SENDER = "918308178738"; // your LiveOne “from” number

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        setCategories(await response.json());
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories once categories arrive
  useEffect(() => {
    const fetchSubcategories = async () => {
      const result = {};
      try {
        for (const cat of categories) {
          const resp = await fetch(
            `/api/subcategories/category/${cat.category_id}`
          );
          result[cat.category_id] = resp.ok ? await resp.json() : [];
        }
        setSubcategories(result);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    if (categories.length) fetchSubcategories();
  }, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };


  const showResendVerificationPopup = (email) => {
    Swal.fire({
      title: "Email Not Verified",
      text: "Your email is not verified. Would you like us to resend the verification email?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Resend Verification Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#F58A3B",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resp = await fetch("/api/users/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await resp.json();
          if (!resp.ok) throw data;

          Swal.fire("Success", data.message || "Verification email sent!", "success");
        } catch (error) {
          Swal.fire(
            "Error",
            error.message || "Failed to resend verification email. Please try again later.",
            "error"
          );
        }
      }
    });
  };


  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json();

      if (!resp.ok) throw data;

      localStorage.setItem("token", data.token);
      const { role, phone } = jwtDecode(data.token);

      // TODO: Re-enable phone verification SMS as needed

      Swal.fire({
        title: "Login Successful!",
        text: "Redirecting to your dashboard…",
        icon: "success",
        confirmButtonColor: "#00234E",
      }).then(() => {
        if (role === "Customer") navigate("/Cdashinner");
        else if (role === "Admin") navigate("/Adashinner");
        else if (role === "Distributor") navigate("/Ddashinner");
        else if (role === "Employee") navigate("/Edashinner");
        else Swal.fire("Error", "Invalid role received", "error");
      });

    } catch (error) {
      if (error?.errorCode === 1000) {
        Swal.fire({
          title: "Login Failed",
          text: error.message || "Invalid email or password",
          icon: "info",
          confirmButtonColor: "#f39c12",
        });
      } else if (error?.errorCode === 1001) {
        Swal.fire({
          title: "Verification Pending",
          text: error.message || "Wait for Admin Verification.",
          icon: "info",
          confirmButtonColor: "#d33",
        });
      } /*else if (error?.errorCode === 1002) {
        showResendVerificationPopup(formData.email);
      }*/ else {
        Swal.fire({
          title: "Login Failed",
          text: error.message || "An unexpected error occurred.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!resp.ok) {
        const { message } = await resp.json();
        throw new Error(message || "Request failed");
      }
      Swal.fire(
        "Email Sent",
        "Check your inbox for the reset link.",
        "success"
      );
      setMode("login");
      setFormData({ email: "", password: "" });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
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
      <div className="relative flex w-3/4 h-[75vh] bg-white bg-opacity-80 rounded-lg shadow-xl overflow-hidden gap-8 p-8">
        {/* Form */}
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          {mode === "login" ? (
            <>
              <h2 className="text-2xl text-[#1e293b] font-bold mb-4 text-center">
                Login
              </h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="relative w-full mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#F58A3B] text-white p-3 rounded hover:bg-[#d87730] transition"
                >
                  Login
                </button>
              </form>
              <p className="mt-4 text-center">
                <button
                  onClick={() => setMode("forgot")}
                  className="text-[#F58A3B] hover:underline"
                >
                  Forgot Password?
                </button>
              </p>
              <p className="mt-2 text-center">
                Don’t have an account?{" "}
                <Link
                  to="/Registration"
                  className="text-[#F58A3B] hover:underline"
                >
                  Register
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl text-[#1e293b] font-bold mb-4 text-center">
                Reset Password
              </h2>
              <form onSubmit={handleForgot}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your registered email"
                  className="w-full mb-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#F58A3B] text-white p-3 rounded hover:bg-[#d87730] transition"
                >
                  Send Reset Link
                </button>
              </form>
              <p className="mt-4 text-center">
                <button
                  onClick={() => {
                    setMode("login");
                    setFormData({ email: "", password: "" });
                  }}
                  className="text-[#F58A3B] hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </>
          )}
        </div>

        {/* Categories Panel (unchanged) */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh] rounded-lg">
          <h2 className="text-2xl text-[#F58A3B] font-bold mb-4 text-center">
            Government Document Services
          </h2>
          <ul className="grid grid-cols-2 gap-6">
            {categories.map((cat) => (
              <li key={cat.category_id} className="text-gray-700 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 text-sm">⚫</span>
                  <span className="font-medium">{cat.category_name}</span>
                </div>
                {subcategories[cat.category_id]?.length > 0 && (
                  <ul className="pl-6 mt-1 text-gray-600 text-sm list-disc">
                    {subcategories[cat.category_id].map((sub) => (
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
