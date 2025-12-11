import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL  from '../config/api';

const TermsAndConditions = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchTnC = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/privacy-policy/type/` +
            encodeURIComponent("Terms and Conditions")
        );
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          const doc = data[0];
          if (doc.policyFileUrl) {
            setFileUrl(doc.policyFileUrl);
          } else {
            setError("No Terms and Conditions file found.");
          }
        } else {
          setError("No Terms and Conditions data found.");
        }
      } catch (err) {
        console.error("Error fetching T&C:", err);
        setError("Failed to fetch Terms and Conditions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTnC();
  }, []);

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "TermsAndConditions";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) return <div>Loading Terms and Conditions…</div>;
  if (error)
    return (
      <div className="text-center py-10">
        <h2 className="text-red-600 text-2xl font-semibold">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );

  const fileType = fileUrl.split(".").pop().toLowerCase();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Terms and Conditions
      </h1>
      <div className="flex justify-center mb-6">
        {fileType === "pdf" ? (
          <iframe
            src={fileUrl}
            title="Terms and Conditions"
            className="w-full h-[500px] border border-gray-300"
          />
        ) : (
          <>
            {imageError ? (
              <div className="flex flex-col items-center justify-center p-8 border border-gray-300 bg-gray-50 rounded">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4 text-center">Unable to display image inline</p>
                <button
                  onClick={handleOpenInNewTab}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Open in New Tab
                </button>
              </div>
            ) : (
              <img
                src={fileUrl}
                alt="Terms and Conditions"
                className="max-w-full h-auto border border-gray-300"
                onError={handleImageError}
              />
            )}
          </>
        )}
      </div>
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="bg-[#F79711] text-white px-6 py-2 rounded-md hover:bg-[#e68a0f] transition duration-200"
        >
          Download as {fileType === "pdf" ? "PDF" : "Image"}
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
