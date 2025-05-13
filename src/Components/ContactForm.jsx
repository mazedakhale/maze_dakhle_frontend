import React, { useState, useEffect } from "react";
import axios from "axios";

const ContactForm = () => {
  const [fields, setFields] = useState([]); // Stores keys fetched from the Field API
  const [formValues, setFormValues] = useState({}); // Stores key-value pairs for the Contact API
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track form submission
  const fieldApiUrl = "https://mazedakhale.in/api/field"; // API to fetch keys
  const contactApiUrl = "https://mazedakhale.in/api/contact"; // API to save key-value pairs

  // Fetch keys from the Field API
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get(fieldApiUrl);
        setFields(response.data);

        // Initialize form values with empty strings
        const initialValues = {};
        response.data.forEach((field) => {
          initialValues[field.key] = "";
        });
        setFormValues(initialValues);
      } catch (error) {
        console.error("Error fetching fields:", error);
        alert("Failed to fetch fields. Please try again later.");
      }
    };

    fetchFields();
  }, []);

  // Handle input change
  const handleInputChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (Object.values(formValues).some((value) => !value.trim())) {
      alert("All fields are required!");
      return;
    }

    setIsLoading(true);
    try {
      // Send all key-value pairs as a single object
      await axios.post(contactApiUrl, formValues);

      // Mark the form as submitted
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save contact information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If form is submitted, show only the success message
  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-gray-700">
            Your response has been submitted successfully. We will get back to
            you soon.
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, show the form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Contact Information
        </h2>

        {/* Form */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {field.key}
              </label>
              <input
                type="text"
                placeholder={`Enter ${field.key}`}
                value={formValues[field.key] || ""}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-orange-300 focus:outline-none"
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
