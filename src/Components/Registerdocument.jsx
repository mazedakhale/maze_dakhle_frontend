import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const RegisterDocument = () => {
  const { id, role } = useParams(); // Get user ID and role from URL params
  console.log("User ID:", id);
  console.log("User Role:", role);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    shopAddress: "",
    files: [null, null], // Two files: Aadhar & PAN
    errors: ["", ""], // Errors for file size validation
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0]; // Get the selected file
    const updatedFiles = [...formData.files];
    const updatedErrors = [...formData.errors];

    if (file) {
      if (file.size > 500 * 1024) {
        updatedErrors[index] = "File size should not exceed 500KB";
        updatedFiles[index] = null; // Reset the file if size exceeds limit
      } else {
        updatedErrors[index] = "";
        updatedFiles[index] = file;
      }
    } else {
      updatedFiles[index] = null;
      updatedErrors[index] = "";
    }

    setFormData({ ...formData, files: updatedFiles, errors: updatedErrors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.address || formData.files.includes(null)) {
      Swal.fire(
        "Error",
        "Please fill all fields and upload both documents.",
        "error"
      );
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("phone", formData.phone);
    formDataObj.append("address", formData.address);
    formDataObj.append("shopAddress", formData.shopAddress || "");

    const documentTypes = ["Aadhar Card", "PAN Card"];
    formData.files.forEach((file, index) => {
      formDataObj.append("files", file);
      formDataObj.append("documentTypes", documentTypes[index]); // Fixed document type
    });

    try {
      const response = await fetch(
        `https://mazedakhale.in/api/users/update/${id}`,
        {
          method: "PUT",
          body: formDataObj,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload documents");
      }

      Swal.fire({
        title: "Success",
        text: "Documents uploaded successfully! You have to wait for Admin verification.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/"); // Redirect to login page after success
      });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Upload Documents
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Input */}
          <input
            type="text"
            name="phone"
            placeholder="Enter Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Address Input */}
          <input
            type="text"
            name="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Shop Address Input (Optional) */}
          <input
            type="text"
            name="shopAddress"
            placeholder="Enter Shop Address (Optional)"
            value={formData.shopAddress}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* File Upload - Aadhar Card */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">
              Upload Aadhar Card
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 0)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.errors[0] && (
              <p className="text-red-500 text-sm">{formData.errors[0]}</p>
            )}
          </div>

          {/* File Upload - PAN Card */}
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">
              Upload PAN Card
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 1)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.errors[1] && (
              <p className="text-red-500 text-sm">{formData.errors[1]}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Upload Documents
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDocument;
