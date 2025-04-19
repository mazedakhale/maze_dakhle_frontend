import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../index.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    shopAddress: "",
    district: "",
    taluka: "",
    role: "Customer",
    aadharCard: null,
    panCard: null,
    agreeToTerms: false,
    errors: {
      aadharCard: "",
      panCard: "",
      agreeToTerms: ""
    }
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://mazedakhale.in/api/categories");
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
            `https://mazedakhale.in/api/subcategories/category/${category.category_id}`
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      errors: {
        ...formData.errors,
        [name]: ""
      }
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setFormData((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: "File type not supported. Please upload PDF, JPG, or PNG."
          }
        }));
        return;
      }

      if (file.size > maxSize) {
        setFormData((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: "File size exceeds 5MB limit"
          }
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: file,
        errors: {
          ...prev.errors,
          [field]: ""
        }
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formData.errors };

    if (!formData.aadharCard) {
      newErrors.aadharCard = "Aadhar Card is required";
      isValid = false;
    }

    if (!formData.panCard) {
      newErrors.panCard = "PAN Card is required";
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms & Conditions";
      isValid = false;
    }

    setFormData((prev) => ({ ...prev, errors: newErrors }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        icon: "error",
        confirmButtonColor: "#d33"
      });
      return;
    }

    Swal.fire({
      title: "Processing",
      html: "Please wait while we register your account...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("shopAddress", formData.shopAddress || "");
      formDataToSend.append("district", formData.district);
      formDataToSend.append("taluka", formData.taluka);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("files", formData.aadharCard);
      formDataToSend.append("files", formData.panCard);
      formDataToSend.append("documentTypes", "Aadhar Card");
      formDataToSend.append("documentTypes", "PAN Card");

      const response = await fetch("https://mazedakhale.in/api/users/register", {
        method: "POST",
        body: formDataToSend
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Registration successful!",
          icon: "success",
          confirmButtonColor: "#00234E"
        }).then(() => navigate("/login"));
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#d33"
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
      <div className="flex w-11/12 h-[100vh] bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden gap-8 p-8">        {/* Left Column - Register Form */}
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-600">*</span></label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              onChange={handleChange}
              required
            />
            <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              onChange={handleChange}
              required
            />
            <label className="block text-xs font-medium text-gray-700 mb-1">Password <span className="text-red-600">*</span></label>
            <input

              type="text"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              onChange={handleChange}
              required
            />
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone No<span className="text-red-600">*</span></label>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              onChange={handleChange}
              required
            />
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Shop Address</label>
                <input
                  type="text"
                  name="shopAddress"
                  placeholder="Shop Address (Optional)"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* District and Taluka in one line */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">District <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Taluka <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="taluka"
                  placeholder="Taluka"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <input type="hidden" name="role" value="Customer" />


            {/* File Uploads in one line */}
            <div className="flex space-x-4">
              <div className="w-1/2 space-y-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Aadhar Card"Max Size:500KB <span className="text-red-600">*</span></label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "aadharCard")}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${formData.errors.aadharCard ? "border-red-500" : ""
                    }`}
                  required
                />
                {formData.errors.aadharCard && (
                  <p className="mt-1 text-xs text-red-600">{formData.errors.aadharCard}</p>
                )}
              </div>
              <div className="w-1/2 space-y-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card :Max Size :500KB<span className="text-red-600">*</span></label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "panCard")}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${formData.errors.panCard ? "border-red-500" : ""
                    }`}
                  required
                />
                {formData.errors.panCard && (
                  <p className="mt-1 text-xs text-red-600">{formData.errors.panCard}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`h-4 w-4 text-[#F58A3B] focus:ring-[#F58A3B] border-gray-300 rounded ${formData.errors.agreeToTerms ? "border-red-500" : ""
                    }`}
                  required
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <Link
                    to="/PrivacyPolicy"
                    className="text-[#F58A3B] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms & Conditions
                  </Link>
                </label>
                {formData.errors.agreeToTerms && (
                  <p className="mt-1 text-xs text-red-600">{formData.errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#F58A3B] hover:bg-[#e07d35] text-white py-2 rounded text-xs"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-xs">
            Already have an account?{' '}
            <Link to="/" className="text-[#F58A3B] hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right Column - Document List with Categories & Subcategories */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[95vh] rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">Government Document Services</h2>
          <ul className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <li key={category.category_id} className="text-gray-700 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-orange text-xs">⚫</span>
                  <span className="text-xs">{category.category_name}</span>
                </div>

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