import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const AddDistributorModal = ({ isOpen, onClose, fetchDistributors }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    shopAddress: "",
    aadharCard: null,
    panCard: null,
    errors: { aadharCard: "", panCard: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Used For File Change
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setFormData((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]:
              "File type not supported. Please upload a PDF, JPG, or PNG file.",
          },
        }));
        return;
      }

      if (file.size > maxSize) {
        setFormData((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: "File size exceeds 5MB. Please upload a smaller file.",
          },
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

    if (!formData.aadharCard || !formData.panCard) {
      Swal.fire({
        title: "Error",
        text: "Please upload both Aadhar Card and PAN Card.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("shopAddress", formData.shopAddress);
    formDataToSend.append("role", "Distributor"); // Set role as Distributor
    formDataToSend.append("user_login_status", "Active");
    formDataToSend.append("files", formData.aadharCard);
    formDataToSend.append("documentTypes", "Aadhar Card");
    formDataToSend.append("files", formData.panCard);
    formDataToSend.append("documentTypes", "PAN Card");

    try {
      const response = await axios.post(
        "http://localhost:3000/users/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: "Registration Successful!",
          text: "Distributor has been added.",
          icon: "success",
          confirmButtonColor: "#00234E",
          confirmButtonText: "OK",
        }).then(() => {
          fetchDistributors(); // Refresh the distributor list
          onClose(); // Close the modal
        });
      } else {
        Swal.fire({
          title: "Registration Failed",
          text: response.data.message || "Please try again.",
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Add Distributor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="shopAddress"
            placeholder="Shop Address (Optional)"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />

          <div>
            <label className="block font-medium">Upload Aadhar Card</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "aadharCard")}
              className="w-full p-2 border rounded"
              required
            />
            {formData.errors.aadharCard && (
              <p className="text-red-500 text-xs">
                {formData.errors.aadharCard}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Upload PAN Card</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "panCard")}
              className="w-full p-2 border rounded"
              required
            />
            {formData.errors.panCard && (
              <p className="text-red-500 text-xs">{formData.errors.panCard}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Distributor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDistributorModal;
