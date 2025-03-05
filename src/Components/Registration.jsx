// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert
import "../index.css"; // Ensure Tailwind & CSS are imported

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/categories");
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

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategoryData = {};
        for (const category of categories) {
          const response = await fetch(
            `https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/subcategories/category/${category.category_id}`
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { ...formData, role: "Customer", user_login_status: "Active" };
    try {
      const response = await fetch("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Registration Successful!",
          text: "You can now log in.",
          icon: "success",
          confirmButtonColor: "#00234E",
          confirmButtonText: "OK",
        }).then(() => navigate("/"));
      } else {
        Swal.fire({
          title: "Registration Failed",
          text: data.message || "Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://web.edcrib.com/updates/wp-content/uploads/2024/08/edcrib-blog1-1024x683.jpeg')",
      }}
    >
      <div className="flex w-3/4 h-[75vh] bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden gap-8 p-8">
        {/* Left Column - Register Form */}
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl text-[#1e293b] font-bold mb-4 text-center">Register</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Name" className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            <button type="submit" className="w-full bg-[#00234E] hover:bg-[#1e293b] text-white py-2 rounded">Register</button>
          </form>
          <p className="mt-4 text-center">Already have an account? <Link to="/" className="text-[#1e293b] hover:underline">Login</Link></p>
        </div>

        {/* Right Column - Document List with Categories & Subcategories */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh] rounded-lg">
          <h2 className="text-2xl text-[#00234E] font-bold mb-4 text-center">Government Document Services</h2>
          <ul className="grid grid-cols-2 gap-6">
            {categories.map((category) => (
              <li key={category.category_id} className="text-gray-700 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-black text-sm">⚫</span>
                  <span>{category.category_name}</span>
                </div>

                {/* Subcategories as sub-bullets */}
                {subcategories[category.category_id]?.length > 0 && (
                  <ul className="ml-6 mt-2">
                    {subcategories[category.category_id]?.map((sub) => (
                      <li key={sub.subcategory_id} className="flex items-center space-x-2 text-gray-600">
                        <span className="text-gray-500 text-xs">●</span>
                        <span className="text-sm">{sub.subcategory_name}</span>
                      </li>
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

export default Register;
