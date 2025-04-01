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
    phone: "",
    address: "",
    shopAddress: "",
    district: "", // Add district
    taluka: "", // Add taluka
    aadharCard: null,
    panCard: null,
    errors: { aadharCard: "", panCard: "" },
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://mazedakhale.in/categories");
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
            `https://mazedakhale.in/subcategories/category/${category.category_id}`
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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setFormData((prev) => ({
          ...prev,
          errors: { ...prev.errors, [field]: "File type not supported. Please upload a PDF, JPG, or PNG file." },
        }));
        return;
      }

      if (file.size > maxSize) {
        setFormData((prev) => ({
          ...prev,
          errors: { ...prev.errors, [field]: "File size exceeds 5MB. Please upload a smaller file." },
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: file,
        errors: { ...prev.errors, [field]: "" },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that both Aadhar Card and PAN Card are uploaded
    if (!formData.aadharCard || !formData.panCard) {
      Swal.fire({
        title: "Error",
        text: "Please upload both Aadhar Card and PAN Card.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // Show "Processing, please wait" alert
    Swal.fire({
      title: "Processing",
      text: "Please wait while your request is being processed...",
      icon: "info",
      allowOutsideClick: false, // Prevent closing by clicking outside
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    // Create FormData object to send to the backend
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("shopAddress", formData.shopAddress || ""); // Optional field
    formDataToSend.append("district", formData.district); // Add district
    formDataToSend.append("taluka", formData.taluka); // Add taluka
    formDataToSend.append("role", "Customer"); // Hardcode role as "Customer"

    // Append files and document types
    formDataToSend.append("files", formData.aadharCard);
    formDataToSend.append("files", formData.panCard);
    formDataToSend.append("documentTypes", "Aadhar Card");
    formDataToSend.append("documentTypes", "PAN Card");

    try {
      // Send the registration request to the backend
      const response = await fetch("https://mazedakhale.in/users/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      // Close the "Processing" alert
      Swal.close();

      if (response.ok) {
        // Show success message and redirect to login page
        Swal.fire({
          title: "Registration Successful!",
          text: "You can now log in.",
          icon: "success",
          confirmButtonColor: "#00234E",
          confirmButtonText: "OK",
        }).then(() => navigate("/Login"));
      } else {
        // Show error message if registration fails
        Swal.fire({
          title: "Registration Failed",
          text: data.message || "Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);

      // Close the "Processing" alert and show error message
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
      <div className="flex w-4/5 h-[90vh] bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden gap-8 p-8">
        {/* Left Column - Register Form */}
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="name" placeholder="Name" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" onChange={handleChange} required />
            <input
              type="text" // Always show password in plain text
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              onChange={handleChange}
              required
            />
            <input type="text" name="phone" placeholder="Phone" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" onChange={handleChange} required />
            <input type="text" name="shopAddress" placeholder="Shop Address (Optional)" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" onChange={handleChange} />

            {/* District and Taluka in one line */}
            <div className="flex space-x-4">
              <input
                type="text"
                name="district"
                placeholder="District"
                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="taluka"
                placeholder="Taluka"
                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                onChange={handleChange}
                required
              />
            </div>

            {/* File Upload - Aadhar Card */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 text-xs">Upload Aadhar Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, "aadharCard")}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
              {formData.errors.aadharCard && <p className="text-red-500 text-xs">{formData.errors.aadharCard}</p>}
            </div>

            {/* File Upload - PAN Card */}
            <div className="space-y-1">
              <label className="block font-medium text-gray-700 text-xs">Upload PAN Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, "panCard")}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
              {formData.errors.panCard && <p className="text-red-500 text-xs">{formData.errors.panCard}</p>}
            </div>

            <button type="submit" className="w-full bg-[#F58A3B] hover:bg-[##F58A3B] text-white py-2 rounded text-xs">Register</button>
          </form>
          <p className="mt-4 text-center text-xs">Already have an account? <Link to="/" className="text-[##F58A3B] hover:underline">Login</Link></p>
        </div>

        {/* Right Column - Document List with Categories & Subcategories */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh] rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">Government Document Services</h2>
          <ul className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <li key={category.category_id} className="text-gray-700 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-orange text-xs">⚫</span>
                  <span className="text-xs">{category.category_name}</span>
                </div>

                {/* Subcategories as sub-bullets */}
                {subcategories[category.category_id]?.length > 0 && (
                  <ul className="ml-6 mt-2">
                    {subcategories[category.category_id]?.map((sub) => (
                      <li key={sub.subcategory_id} className="flex items-center space-x-2 text-gray-600">
                        <span className="text-gray-500 text-xs">●</span>
                        <span className="text-xs">{sub.subcategory_name}</span>
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