import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

const Apply = () => {
  const [documentNames, setDocumentNames] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { categoryId, categoryName, subcategoryId, subcategoryName } = location.state || {};
  const [fieldNames, setFieldNames] = useState([]);
  const token = localStorage.getItem("token");
  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));

        setUserData({
          user_id: decodedPayload?.user_id ? String(decodedPayload.user_id) : "",
          name: decodedPayload?.name || "",
          email: decodedPayload?.email || "",
          phone: decodedPayload?.phone || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

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

  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      axios
        .get(` https://mazedakhale.in/api/required-documents/${formData.category_id}/${formData.subcategory_id}`)
        .then((response) => {
          if (response.data.length > 0 && response.data[0].document_names) {
            const documentsArray = response.data[0].document_names.split(",").map((doc) => doc.trim());
            setDocumentNames(documentsArray);
            setSelectedFiles(documentsArray.reduce((acc, doc) => ({ ...acc, [doc]: null }), {}));
          } else {
            setDocumentNames([]);
          }
        })
        .catch((error) => console.error("Error fetching documents:", error));
    } else {
      setDocumentNames([]);
    }
  }, [formData.category_id, formData.subcategory_id]);

  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      axios
        .get(` https://mazedakhale.in/api/field-names/${formData.category_id}/${formData.subcategory_id}`)
        .then((response) => {
          if (response.data.length > 0 && response.data[0].document_fields) {
            const fieldsArray = response.data[0].document_fields.split(",").map((field) => field.trim());
            setFieldNames(fieldsArray);
            setFormData((prev) => ({
              ...prev,
              document_fields: fieldsArray.reduce((acc, field) => ({ ...acc, [field]: "" }), {}),
            }));
          } else {
            setFieldNames([]);
          }
        })
        .catch((error) => console.error("Error fetching field names:", error));
    } else {
      setFieldNames([]);
    }
  }, [formData.category_id, formData.subcategory_id]);

  const handleFieldChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      document_fields: { ...prev.document_fields, [fieldName]: e.target.value },
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleFileUpload = (e, docName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setErrors((prev) => ({ ...prev, [docName]: "File size is more than 500 KB." }));
      } else {
        setErrors((prev) => ({ ...prev, [docName]: "" }));
        setSelectedFiles((prev) => ({ ...prev, [docName]: file }));
        setFormData((prev) => ({
          ...prev,
          files: { ...prev.files, [docName]: file },
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Full Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.phone) newErrors.phone = "Phone Number is required.";

    fieldNames.forEach((field) => {
      if (!formData.document_fields[field]) {
        newErrors[field] = `${field} is required.`;
      }
    });

    documentNames.forEach((doc) => {
      // Skip validation if the document name is "other" or "others"
      if (doc.toLowerCase() !== "other" && doc.toLowerCase() !== "others" && !selectedFiles[doc]) {
        newErrors[doc] = `${doc} file is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Form Incomplete',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while your application is being submitted.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Create an ordered array of field objects
    const orderedDocumentFields = fieldNames.map(fieldName => ({
      field_name: fieldName,
      field_value: formData.document_fields[fieldName] || ""
    }));

    const formDataToSend = new FormData();

    // Add the ordered document fields
    formDataToSend.append('document_fields', JSON.stringify(orderedDocumentFields));

    // Add other form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "document_fields") {
        // Skip this as we've already added the ordered version
      } else if (key === "files") {
        Object.entries(value).forEach(([fileKey, file]) => {
          formDataToSend.append("files", file);
          formDataToSend.append("document_types", fileKey); // Add document name (e.g., "Aadhaar Card")
        });
      } else {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        " https://mazedakhale.in/api/documents/upload",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // Set timeout to 30 seconds
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your application has been submitted successfully!',
      }).then(() => window.location.href = '/customerapply');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <div className="ml-[320px] flex flex-col items-center min-h-screen p-10 bg-gray-100">
      <div className="flex-1 flex justify-center pt-9 bg-white items-center py-9 px-9">
        <form
          className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xxl border border-gray-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-bold text-center text-orange-600 mb-3 shadow-md pb-2 rounded-lg">
            Apply for {formData.subcategory_name}
          </h2>


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
                onChange={handleChange}
                value={formData.name || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Full Name"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Email"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                onChange={handleChange}
                value={formData.phone || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Phone Number"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
          </div>


          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">
              APPLICANT  INFORMATION <span className="text-red-500">*</span>
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
                    className={`w-full p-3 border ${errors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md`}
                    placeholder={`Enter ${field}`}
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">UPLOAD DOCUMENTS <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-6">
              {documentNames.map((docName, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-gray-700 font-semibold">
                    {docName}
                    {/* Conditionally render the red asterisk */}
                    {docName.toLowerCase() !== "other" && docName.toLowerCase() !== "others" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, docName)}
                    className={`w-full mt-2 p-3 border ${errors[docName] ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-100 shadow-md`}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  {errors[docName] && <p className="text-red-500 text-sm">{errors[docName]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold p-3 rounded-lg shadow-lg hover:bg-orange-700 transition-all text-lg"
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