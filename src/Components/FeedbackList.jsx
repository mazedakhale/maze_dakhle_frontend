import React, { useState, useEffect } from "react";
import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";

const FeedbackList = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
            }
        }

        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get("http://13.201.37.154:3000/feedback");
            setFeedbackList(response.data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Enter Deletion Code",
            text: "Please enter the code to confirm deletion.",
            input: "text",
            inputPlaceholder: "Enter code here...",
            inputAttributes: { autocapitalize: "off" },
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
            showLoaderOnConfirm: true,
            preConfirm: (inputValue) => {
                if (inputValue !== "0000") {
                    Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
                    return false;
                }
                return true;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmDelete.isConfirmed) {
            // Optimized Approach:
            // 1. Remove from UI first (Makes it feel instant)
            setFeedbackList((prevFeedback) =>
                prevFeedback.filter((feedback) => feedback.feedback_feedback_id !== id)
            );

            // 2. API call runs in background, not blocking UI
            axios
                .delete(`http://13.201.37.154:3000/feedback/${id}`)
                .then(() => {
                    fetchFeedback(); // Refresh list after deletion
                })
                .catch((error) => {
                    console.error("Error deleting feedback:", error);
                    Swal.fire("Error", "Failed to delete feedback", "error");
                });

            // 3. Show success message immediately
            Swal.fire("Deleted!", "Feedback has been deleted.", "success");
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Feedback List</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md"></div>
                </div>

                {/* Table */}
                <div className="p-6 overflow-x-auto">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {["User ID", "Name", "Role", "Comment", "Rating", "Actions"].map((header, index) => (
                                    <th key={index} className="px-4 py-3 border border-[#776D6DA8] text-black font-semibold text-center">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackList.length > 0 ? (
                                feedbackList.map((feedback, index) => (
                                    <tr
                                        key={feedback.feedback_feedback_id}
                                        className={`${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F58A3B14]"} hover:bg-orange-100 transition duration-200`}
                                    >
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{feedback.feedback_user_id}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{feedback.users_name || "N/A"}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{feedback.users_role || "N/A"}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">{feedback.feedback_comment}</td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            {[...Array(feedback.feedback_rating)].map((_, i) => (
                                                <StarIcon key={i} color="warning" />
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 border border-[#776D6DA8] text-center">
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                onClick={() => handleDelete(feedback.feedback_feedback_id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-3 border border-[#776D6DA8] text-center">
                                        No feedback found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FeedbackList;