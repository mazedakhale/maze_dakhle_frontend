import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
} from "../utils/formValidators"; // Import your validators

const USER_API_BASE = "http://localhost:3000/users";
const PASSWORD_API = `${USER_API_BASE}/password`;
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [passMode, setPassMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    phone: "",
    address: "",
    shopAddress: "",
    district: "",
    taluka: "",
    aadharCard: null,
    panCard: null,
    existingAadharPath: "",
    existingPanPath: "",
    errors: {
      phone: "",
      aadharCard: "",
      panCard: "",
    },
  });

  const navigate = useNavigate();

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPassError("Password is required");
      return false;
    }
    if (!isValidPassword(password)) {
      setPassError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return false;
    }
    setPassError("");
    return true;
  };

  const openImageModal = (src) => {
    setModalImageSrc(src);
    setShowImageModal(true);
  };

  // Phone validation
  const validatePhone = (phone) => {
    if (!phone) {
      setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, phone: "Phone is required" },
      }));
      return false;
    }
    if (!isValidPhone(phone)) {
      setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, phone: "Phone must be exactly 10 digits" },
      }));
      return false;
    }
    setFormValues((fv) => ({
      ...fv,
      errors: { ...fv.errors, phone: "" },
    }));
    return true;
  };

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      Swal.fire("Error", "Email is required", "error");
      return false;
    }
    if (!isValidEmail(email)) {
      Swal.fire("Error", "Please enter a valid email address", "error");
      return false;
    }
    return true;
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/Login");

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem("token");
      return navigate("/Login");
    }

    try {
      const resp = await axios.get(`${USER_API_BASE}/${decoded.user_id}`);
      const data = resp.data.user || resp.data;

      setUser(data);

      const docs = data.user_documents || [];
      const aDoc = docs.find((d) => d.document_type === "Aadhar Card");
      const pDoc = docs.find((d) => d.document_type === "PAN Card");

      setFormValues({
        phone: data.phone || "",
        address: data.address || "",
        shopAddress: data.shop_address || "",
        district: data.district || "",
        taluka: data.taluka || "",
        aadharCard: null,
        panCard: null,
        existingAadharPath: aDoc?.file_path || "",
        existingPanPath: pDoc?.file_path || "",
        errors: {
          phone: "",
          aadharCard: "",
          panCard: "",
        },
      });
    } catch {
      Swal.fire("Error", "Could not load profile", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading…
      </div>
    );
  }

  // Password change handler with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPass(value);
    validatePassword(value);
  };

  // Phone change handler with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormValues((fv) => ({
      ...fv,
      phone: value,
    }));
    validatePhone(value);
  };

  const savePassword = async () => {
    if (!validatePassword(newPass)) return;

    try {
      await axios.patch(`${PASSWORD_API}/${user.user_id}`, {
        newPassword: newPass,
      });
      setUser((u) => ({ ...u, password: newPass }));
      setPassMode(false);
      setNewPass("");
      setShowPass(false);
      Swal.fire("Success", "Password updated", "success");
    } catch {
      Swal.fire("Error", "Failed to update password", "error");
    }
  };

  const requestProfileEdit = async () => {
    try {
      await axios.post(`${USER_API_BASE}/request-edit/${user.user_id}`);
      setUser((u) => ({ ...u, edit_request_status: "Pending" }));
      Swal.fire("Requested!", "Edit request sent.", "success");
    } catch {
      Swal.fire("Error", "Request failed", "error");
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      return setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, [field]: "Unsupported format." },
      }));
    }
    if (file.size > 500 * 1024) {
      return setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, [field]: "Max 500KB." },
      }));
    }
    setFormValues((fv) => ({
      ...fv,
      [field]: file,
      errors: { ...fv.errors, [field]: "" },
    }));
  };

  const fetchAsFile = async (url) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const name = url.split("/").pop();
    return new File([blob], name, { type: blob.type });
  };

  const saveProfile = async () => {
    // Validate phone
    if (!validatePhone(formValues.phone)) return;

    // Validate documents
    if (!formValues.existingAadharPath && !formValues.aadharCard) {
      return setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, aadharCard: "Aadhar required" },
      }));
    }
    if (!formValues.existingPanPath && !formValues.panCard) {
      return setFormValues((fv) => ({
        ...fv,
        errors: { ...fv.errors, panCard: "PAN required" },
      }));
    }

    const fd = new FormData();
    fd.append("name", user.name);
    fd.append("email", user.email);
    fd.append("phone", formValues.phone);
    fd.append("address", formValues.address);
    fd.append("shop_address", formValues.shopAddress);
    fd.append("district", formValues.district);
    fd.append("taluka", formValues.taluka);

    // Aadhar
    let aFile = formValues.aadharCard;
    if (!aFile && formValues.existingAadharPath) {
      aFile = await fetchAsFile(formValues.existingAadharPath);
    }
    if (aFile) {
      fd.append("files", aFile);
      fd.append("documentTypes", "Aadhar Card");
    }

    // PAN
    let pFile = formValues.panCard;
    if (!pFile && formValues.existingPanPath) {
      pFile = await fetchAsFile(formValues.existingPanPath);
    }
    if (pFile) {
      fd.append("files", pFile);
      fd.append("documentTypes", "PAN Card");
    }

    try {
      await axios.put(`${USER_API_BASE}/update/${user.user_id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProfile();
      setEditMode(false);
      Swal.fire("Success", "Profile updated", "success");
    } catch (err) {
      console.error("Server error:", err.response?.data);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          JSON.stringify(err.response?.data, null, 2),
        "error"
      );
    }
  };

  const canEdit = user.edit_request_status === "Approved";

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">My Profile</h1>

        {/* Password */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Password:</span>
            {passMode ? (
              <div className="flex flex-col">
                <div className="flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    className={`border p-1 rounded w-48 ${
                      passError ? "border-red-500" : ""
                    }`}
                    value={newPass}
                    onChange={handlePasswordChange}
                  />
                  <button
                    onClick={() => setShowPass((s) => !s)}
                    className="ml-2 text-gray-600"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passError && (
                  <span className="text-red-500 text-xs">{passError}</span>
                )}
              </div>
            ) : (
              <span>{showPass ? user.password : "•".repeat(8)}</span>
            )}
          </div>
          {passMode ? (
            <>
              <button
                onClick={savePassword}
                className="text-green-600 mr-2"
                disabled={!!passError}
              >
                <FaSave /> Save
              </button>
              <button
                onClick={() => {
                  setPassMode(false);
                  setNewPass("");
                  setShowPass(false);
                  setPassError("");
                }}
                className="text-red-600"
              >
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setPassMode(true)} className="text-blue-600">
              <FaEdit /> Edit Password
            </button>
          )}
        </div>

        {/* Edit Status */}
        {user.edit_request_status && (
          <p className="text-sm mb-3 text-center">
            Edit Status:{" "}
            <strong
              className={
                user.edit_request_status === "Approved"
                  ? "text-green-600"
                  : user.edit_request_status === "Rejected"
                  ? "text-red-500"
                  : "text-yellow-500"
              }
            >
              {user.edit_request_status}
            </strong>
          </p>
        )}

        {/* Edit / Request */}
        {!editMode && (
          <div className="text-center mb-4">
            {canEdit ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={requestProfileEdit}
                disabled={user.edit_request_status === "Pending"}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Request PRofile Edit
              </button>
            )}
          </div>
        )}

        {/* Fields */}
        <div>
          {/* Name & Email */}
          <div className="mb-2 flex items-center">
            <span className="w-32 font-semibold">Name:</span>
            <span className="flex-1">{user.name}</span>
          </div>
          <div className="mb-2 flex items-center">
            <span className="w-32 font-semibold">Email:</span>
            <span className="flex-1">{user.email}</span>
          </div>

          {/* Phone with validation */}
          <div className="mb-2 flex items-center">
            <span className="w-32 font-semibold">Phone:</span>
            {editMode ? (
              <div className="flex flex-col flex-1">
                <input
                  className={`border p-1 rounded ${
                    formValues.errors.phone ? "border-red-500" : ""
                  }`}
                  value={formValues.phone}
                  onChange={handlePhoneChange}
                />
                {formValues.errors.phone && (
                  <span className="text-red-500 text-xs">
                    {formValues.errors.phone}
                  </span>
                )}
              </div>
            ) : (
              <span className="flex-1">{user.phone || "—"}</span>
            )}
          </div>

          {/* Other fields */}
          {["address", "shopAddress", "district", "taluka"].map((f) => (
            <div key={f} className="mb-2 flex items-center">
              <span className="w-32 font-semibold">
                {f
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase())}
                :
              </span>
              {editMode ? (
                <input
                  className="border p-1 rounded flex-1"
                  value={formValues[f]}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, [f]: e.target.value }))
                  }
                />
              ) : (
                <span className="flex-1">
                  {f === "shopAddress"
                    ? user.shop_address || "—"
                    : user[f] || "—"}
                </span>
              )}
            </div>
          ))}

          {/* Aadhar */}
          <div className="mb-4 flex items-center">
            <span className="w-32 font-semibold">Aadhar Card:</span>
            {formValues.existingAadharPath ? (
              <button
                type="button"
                onClick={() => openImageModal(formValues.existingAadharPath)}
                className="text-blue-600 underline mr-4"
              >
                View
              </button>
            ) : (
              <span className="mr-4">No file</span>
            )}

            {/* REMOVE file input field */}
          </div>

          {/* PAN */}
          <div className="mb-4 flex items-center">
            <span className="w-32 font-semibold">PAN Card:</span>
            {formValues.existingPanPath ? (
              <button
                type="button"
                onClick={() => openImageModal(formValues.existingPanPath)}
                className="text-blue-600 underline mr-4"
              >
                View
              </button>
            ) : (
              <span className="mr-4">No file</span>
            )}

            {/* REMOVE file input field */}
          </div>

          {/* Save / Cancel */}
          {editMode && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={saveProfile}
                disabled={
                  !!formValues.errors.phone ||
                  !!formValues.errors.aadharCard ||
                  !!formValues.errors.panCard
                }
                className={`px-4 py-2 text-white rounded ${
                  !!formValues.errors.phone ||
                  !!formValues.errors.aadharCard ||
                  !!formValues.errors.panCard
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500"
                }`}
              >
                <FaSave /> Save Profile
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  fetchProfile(); // Reset form values
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 block mx-auto text-gray-600 hover:underline"
        >
          Back
        </button>
      </div>
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-4 relative max-w-[90vw] max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <FaTimes size={18} />
            </button>
            <img
              src={modalImageSrc}
              alt="Document Preview"
              className="max-w-full max-h-[80vh] rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
