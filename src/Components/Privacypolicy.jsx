import React, { useEffect, useState } from "react";
import axios from "axios";

const PrivacyPolicy = () => {
    const [fileUrl, setFileUrl] = useState(null); // State to store the file URL
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch the Privacy Policy file from the API
    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const response = await axios.get("https://mazedakhale.in:3000/privacy-policy");
                console.log("API Response:", response.data); // Log the response

                // Check if the response is an array and has at least one element
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const policyData = response.data[0]; // Get the first element
                    if (policyData.policyFileUrl) {
                        setFileUrl(policyData.policyFileUrl); // Set the file URL
                    } else {
                        setError("No Privacy Policy file found in the response.");
                    }
                } else {
                    setError("No Privacy Policy data found.");
                }
            } catch (error) {
                console.error("Error fetching Privacy Policy:", error);
                setError("Failed to fetch Privacy Policy.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyPolicy();
    }, []);

    // Handle file download
    const handleDownload = () => {
        if (fileUrl) {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = "PrivacyPolicy"; // Default file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Display loading state
    if (loading) {
        return <div>Loading Privacy Policy...</div>;
    }

    // Display error state
    if (error) {
        return (
            <div className="text-center py-10">
                <h2 className="text-red-600 text-2xl font-semibold">Error</h2>
                <p className="text-gray-700">{error}</p>
            </div>
        );
    }

    // Determine the file type (image or PDF)
    const fileType = fileUrl?.split(".").pop().toLowerCase();

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>

            {/* Display the file */}
            <div className="flex justify-center mb-6">
                {fileType === "pdf" ? (
                    <iframe
                        src={fileUrl}
                        title="Privacy Policy"
                        className="w-full h-[500px] border border-gray-300"
                    />
                ) : (
                    <img
                        src={fileUrl}
                        alt="Privacy Policy"
                        className="max-w-full h-auto border border-gray-300"
                    />
                )}
            </div>

            {/* Download buttons */}
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

export default PrivacyPolicy;