import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTimes } from "react-icons/fa";
import API_BASE_URL  from "../config/api";

const Apply = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { categoryId, categoryName, subcategoryId, subcategoryName } =
    location.state || {};

  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    category_id: categoryId || "",
    subcategory_id: subcategoryId || "",
    category_name: categoryName || "",
    subcategory_name: subcategoryName || "",
    name: "",
    email: "",
    phone: "",
    address: "",
    files: {},
    document_fields: {},
  });

  const [documentNames, setDocumentNames] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [applicationFee, setApplicationFee] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  // Decode JWT token to get user info
  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        setUserData({
          user_id: decodedPayload?.user_id
            ? String(decodedPayload.user_id)
            : "",
          name: decodedPayload?.name || "",
          email: decodedPayload?.email || "",
          phone: decodedPayload?.phone || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  // Update formData user info from decoded token
  useEffect(() => {
    if (userData.user_id) {
      setFormData((prev) => ({
        ...prev,
        user_id: Number(userData.user_id),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      }));
    }
  }, [userData]);

  // Debug formData changes
  useEffect(() => {
    console.log('FormData updated:', {
      category_id: formData.category_id,
      subcategory_id: formData.subcategory_id,
      category_name: formData.category_name,
      subcategory_name: formData.subcategory_name
    });
  }, [formData.category_id, formData.subcategory_id]);

  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      const fetchRequiredDocuments = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/required-documents/${formData.category_id}/${formData.subcategory_id}`
          );

          let documentsArray = [];

          // ✅ Handle different response formats
          if (response.data && Array.isArray(response.data)) {
            // New format: array of objects with document_names property
            documentsArray = response.data
              .map((item) => item.document_names?.trim())
              .filter((doc) => doc && doc.length > 0); // Remove empty/null values
          } else if (
            response.data &&
            response.data.length > 0 &&
            response.data[0]?.document_names
          ) {
            // Old format: single object with comma-separated string
            documentsArray = response.data[0].document_names
              .split(",")
              .map((doc) => doc.trim())
              .filter((doc) => doc.length > 0);
          }

          if (documentsArray.length > 0) {
            setDocumentNames(documentsArray);
            setSelectedFiles(
              documentsArray.reduce((acc, doc) => ({ ...acc, [doc]: null }), {})
            );
          } else {
            // No documents found
            console.warn(
              "No required documents found for this category/subcategory"
            );
            setDocumentNames([]);
            setSelectedFiles({});
          }
        } catch (error) {
          console.error("Error fetching required documents:", error);
          setDocumentNames([]);
          setSelectedFiles({});
        }
      };

      fetchRequiredDocuments();
    } else {
      setDocumentNames([]);
      setSelectedFiles({});
    }
  }, [formData.category_id, formData.subcategory_id]);

  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      const fetchFieldNames = async () => {
        try {
          console.log(`Fetching field names for category: ${formData.category_id}, subcategory: ${formData.subcategory_id}`);
          const response = await axios.get(
            `${API_BASE_URL}/field-names/${formData.category_id}/${formData.subcategory_id}`
          );

          console.log('Field names API response status:', response.status);
          console.log('Field names API response data:', response.data);
          console.log('Response data type:', typeof response.data);
          console.log('Response data is array:', Array.isArray(response.data));

          let fieldsArray = [];

          // ✅ Handle different response formats
          if (response.data && Array.isArray(response.data)) {
            // New format: array of objects
            fieldsArray = response.data
              .map((item) => item.document_fields?.trim())
              .filter((field) => field && field.length > 0); // Remove empty/null values
          } else if (
            response.data &&
            response.data.length > 0 &&
            response.data[0]?.document_fields
          ) {
            // Old format: single object with comma-separated string
            fieldsArray = response.data[0].document_fields
              .split(",")
              .map((field) => field.trim())
              .filter((field) => field.length > 0);
          }
          
          console.log('Processed fields array:', fieldsArray);
          
          if (fieldsArray.length > 0) {
            setFieldNames(fieldsArray);
            setFormData((prev) => ({
              ...prev,
              document_fields: fieldsArray.reduce(
                (acc, field) => ({ ...acc, [field]: "" }),
                {}
              ),
            }));
          } else {
            // No fields found
            console.warn('No field names found for this category/subcategory');
            setFieldNames([]);
            setFormData((prev) => ({
              ...prev,
              document_fields: {},
            }));
          }
        } catch (error) {
          console.error("Error fetching field names:", error);
          console.error("Error response:", error.response);
          console.error("Error status:", error.response?.status);
          console.error("Error data:", error.response?.data);
          setFieldNames([]);
          setFormData((prev) => ({
            ...prev,
            document_fields: {},
          }));
        }
      };

      fetchFieldNames();
    } else {
      setFieldNames([]);
      setFormData((prev) => ({
        ...prev,
        document_fields: {},
      }));
    }
  }, [formData.category_id, formData.subcategory_id]);

  // Fetch application fee and wallet balance
  useEffect(() => {
    const fetchApplicationFee = async () => {
      if (formData.category_id && formData.subcategory_id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/prices/category/${formData.category_id}/subcategory/${formData.subcategory_id}`
          );
          setApplicationFee(response.data.amount || 0);
        } catch (error) {
          console.error("Error fetching application fee:", error);
          setApplicationFee(0);
        }
      }
    };

    const fetchWalletBalance = async () => {
      if (userData.user_id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/wallet`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWalletBalance(response.data.balance || 0);
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          setWalletBalance(0);
        }
      }
    };

    fetchApplicationFee();
    fetchWalletBalance();
  }, [formData.category_id, formData.subcategory_id, userData.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleFieldChange = (e, fieldName) => {
    const value = e.target.value;
    console.log('Field change:', fieldName, 'Value:', value);
    setFormData((prev) => ({
      ...prev,
      document_fields: { ...prev.document_fields, [fieldName]: value },
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleFileUpload = (e, docName) => {
    const file = e.target.files[0];
    if (!file) {
      setErrors((prev) => ({ ...prev, [docName]: "" }));
      setSelectedFiles((prev) => ({ ...prev, [docName]: null }));
      setFormData((prev) => ({
        ...prev,
        files: { ...prev.files, [docName]: null },
      }));
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    const maxSize = 500 * 1024; // 500 KB
    const fileTypeValid =
      allowedTypes.includes(file.type) ||
      allowedTypes.some((type) => {
        const ext = file.name.split(".").pop().toLowerCase();
        return (
          (ext === "pdf" && type === "application/pdf") ||
          (["doc", "docx"].includes(ext) &&
            (type === "application/msword" ||
              type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) ||
          (ext === "png" && type === "image/png") ||
          (["jpg", "jpeg"].includes(ext) &&
            (type === "image/jpeg" || type === "image/jpg"))
        );
      });
    if (!fileTypeValid) {
      setErrors((prev) => ({
        ...prev,
        [docName]: "Only PDF, DOC, DOCX, PNG, JPG, and JPEG files are allowed.",
      }));
      setSelectedFiles((prev) => ({ ...prev, [docName]: null }));
      setFormData((prev) => ({
        ...prev,
        files: { ...prev.files, [docName]: null },
      }));
      // Reset input so user can re-select the file if needed
      e.target.value = null;
      return;
    }
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [docName]: "File size should be under 500 KB.",
      }));
      setSelectedFiles((prev) => ({ ...prev, [docName]: null }));
      setFormData((prev) => ({
        ...prev,
        files: { ...prev.files, [docName]: null },
      }));
      e.target.value = null;
      return;
    }

    // Valid file
    setErrors((prev) => ({ ...prev, [docName]: "" }));
    setSelectedFiles((prev) => ({ ...prev, [docName]: file }));
    setFormData((prev) => ({
      ...prev,
      files: { ...prev.files, [docName]: file },
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    let newErrors = {};

    // Basic validations for user info (name, email, phone)
    if (!formData.name) newErrors.name = "Full Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.phone) newErrors.phone = "Phone Number is required.";

    // Applicant info fields required checks
    fieldNames.forEach((field) => {
      if (
        !formData.document_fields[field] ||
        formData.document_fields[field].trim() === ""
      ) {
        newErrors[field] = `${field} is required.`;
      }
    });

    // Required document file validations
    documentNames.forEach((doc) => {
      if (
        doc.toLowerCase() !== "other" &&
        doc.toLowerCase() !== "others" &&
        !selectedFiles[doc]
      ) {
        newErrors[doc] = `${doc} file is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Form Incomplete",
        text: "Please fill in all required fields and fix errors.",
      });
      return;
    }


    // ✅ Check wallet balance before proceeding - Convert to numbers for proper comparison
    const numericWalletBalance = Number(walletBalance);
    const numericApplicationFee = Number(applicationFee);
    
    if (numericWalletBalance < numericApplicationFee) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Wallet Balance",
        text: `Your wallet balance (₹${walletBalance}) is insufficient. Application fee is ₹${applicationFee}. Please top up your wallet to proceed.`,
        showCancelButton: true,
        confirmButtonText: "Top Up Wallet",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to wallet top-up page
          navigate("/wallet", {
            state: {
              requiredAmount: applicationFee,
              returnPath: "/apply",
              formData: formData,
            },
          });
        }
      });
      return;
    }

    // ✅ Show confirmation with fee deduction info
    const confirmResult = await Swal.fire({
      icon: "info",
      title: "Confirm Application Submission",
      html: `
        <div class="text-left">
          <p><strong>Application Fee:</strong> ₹${applicationFee}</p>
          <p><strong>Current Wallet Balance:</strong> ₹${walletBalance}</p>
          <p><strong>Balance After Deduction:</strong> ₹${
            walletBalance - applicationFee
          }</p>
          <br>
          <p class="text-gray-600">The application fee will be automatically deducted from your wallet.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit & Pay",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    Swal.fire({
      title: "Processing...",
      text: "Please wait while your application is being submitted and payment is being processed.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formDataToSend = new FormData();

    // Add ordered document fields as JSON string
    const orderedDocumentFields = fieldNames.map((fieldName) => ({
      field_name: fieldName,
      field_value: formData.document_fields[fieldName] || "",
    }));
    
    console.log('Document fields being sent:', orderedDocumentFields);
    console.log('Full formData.document_fields:', formData.document_fields);
    console.log('JSON being sent:', JSON.stringify(orderedDocumentFields));
    
    formDataToSend.append(
      "document_fields",
      JSON.stringify(orderedDocumentFields)
    );

    // ✅ Add application fee for wallet deduction
    formDataToSend.append("application_fee", applicationFee);
    formDataToSend.append("wallet_payment", "true");

    // Append other form fields (excluding files and document_fields)
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "files" || key === "document_fields") return;
      formDataToSend.append(key, value);
    });

    // Append files and matching document types in correct order
    const filesArray = [];
    const documentTypesArray = [];
    
    // Ensure consistent order by iterating through documentNames
    documentNames.forEach((docName) => {
      if (formData.files[docName]) {
        filesArray.push(formData.files[docName]);
        documentTypesArray.push(docName);
      }
    });
    
    // Append all files
    filesArray.forEach(file => {
      formDataToSend.append("files", file);
    });
    
    // Append document types array as JSON string to preserve full names
    formDataToSend.append("document_types", JSON.stringify(documentTypesArray));

 
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/upload`,
        formDataToSend,
        {
          timeout: 60000,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.close();

      // ✅ Update wallet balance after successful submission
      setWalletBalance((prev) => prev - applicationFee);

      Swal.fire({
        icon: "success",
        title: "Application Submitted Successfully!",
        html: `
          <div class="text-left">
            <p>✅ Your application has been submitted successfully!</p>
            <p>💰 Application fee of ₹${applicationFee} has been deducted from your wallet.</p>
            <p>💳 Updated wallet balance: ₹${walletBalance - applicationFee}</p>
            <br>
            <p class="text-gray-600">You will receive updates on your application status via email.</p>
          </div>
        `,
      }).then(() => {
        navigate("/customerapply");
      });
    } catch (error) {
      Swal.close();

      let errorMessage = "Unknown error occurred";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // ✅ Handle specific wallet-related errors
      if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("wallet")
      ) {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: errorMessage,
          showCancelButton: true,
          confirmButtonText: "Top Up Wallet",
          cancelButtonText: "Try Again",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: errorMessage,
        });
      }
    }
  };


  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <button
            onClick={() => navigate("/Cdashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form
          className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-bold text-center text-orange-600 mb-3 shadow-md pb-2 rounded-lg">
            Apply for {formData.subcategory_name}
          </h2>

          {/* Category and Subcategory (readonly) */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold text-base">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category_name}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold text-base">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subcategory_name}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                readOnly
                className={`w-full mt-1 p-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Full Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
          </div>

          {/* VLE Email and Phone (readonly) */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly
                className={`w-full mt-1 p-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly
                className={`w-full mt-1 p-2 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Phone Number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Applicant Information Fields */}
          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">
              APPLICANT INFORMATION <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-6">
              {fieldNames.map((field, index) => (
                <div key={index} className="mt-2">
                  <label className="block text-gray-600 mb-1 font-medium">
                    {field} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.document_fields[field] || ""}
                    onChange={(e) => handleFieldChange(e, field)}
                    className={`w-full p-3 border ${
                      errors[field] ? "border-red-500" : "border-gray-300"
                    } rounded-lg shadow-md`}
                    placeholder={`Enter ${field}`}
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Documents */}
          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">
              UPLOAD DOCUMENTS <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-6">
              {documentNames.map((docName, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-gray-700 font-semibold">
                    {docName}
                    {docName.toLowerCase() !== "other" &&
                      docName.toLowerCase() !== "others" && (
                        <span className="text-red-500"> *</span>
                      )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, docName)}
                    className={`w-full mt-2 p-3 border ${
                      errors[docName] ? "border-red-500" : "border-gray-300"
                    } rounded-lg bg-gray-100 shadow-md`}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  {errors[docName] && (
                    <p className="text-red-500 text-sm">{errors[docName]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Application Fee and Wallet Balance */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold text-base">
                  Application Fee
                </label>
                <input
                  type="text"
                  value={`₹ ${Number(applicationFee)?.toFixed(2)}`}
                  readOnly
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold text-base">
                  Wallet Balance
                </label>
                <input
                  type="text"
                  value={`₹ ${Number(walletBalance)?.toFixed(2)}`}
                  readOnly
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              className="w-2/5 bg-orange-600 text-white font-bold p-3 rounded-lg shadow-lg hover:bg-orange-700 transition-all text-lg"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;
