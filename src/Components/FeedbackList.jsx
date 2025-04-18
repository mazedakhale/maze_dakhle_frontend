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
                setUser(jwtDecode(token));
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
            }
        }
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const { data } = await axios.get("https://mazedakhale.in/api/feedback");
            setFeedbackList(data);
        } catch (err) {
            console.error("Error fetching feedback:", err);
        }
    };

    const handleStatusToggle = async (id, newStatus) => {
        // Optimistic UI update
        setFeedbackList((prev) =>
            prev.map((f) =>
                f.feedback_feedback_id === id ? { ...f, status: newStatus } : f
            )
        );
        try {
            await axios.patch(
                `https://mazedakhale.in/api/feedback/status/${id}`,
                { status: newStatus }
            );
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: `Feedback will ${newStatus ? "be shown" : "no longer be shown"}`,
                showConfirmButton: false,
                timer: 1200,
            });
        } catch (err) {
            console.error("Status update failed:", err);
            // Revert on error
            setFeedbackList((prev) =>
                prev.map((f) =>
                    f.feedback_feedback_id === id ? { ...f, status: !newStatus } : f
                )
            );
            Swal.fire("Error", "Could not update display status", "error");
        }
    };

    const handleStatusClick = (feedback) => {
        const newStatus = !feedback.status;
        Swal.fire({
            title: newStatus
                ? "Are you sure you want to display this feedback on the main page?"
                : "Are you sure you want to hide this feedback from the main page?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: newStatus ? "Show" : "Hide",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                handleStatusToggle(feedback.feedback_feedback_id, newStatus);
            }
        });
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
            preConfirm: (val) => {
                if (val !== "0000") {
                    Swal.showValidationMessage("Incorrect code! Deletion not allowed.");
                }
            },
            allowOutsideClick: () => !Swal.isLoading(),
        });

        if (confirmDelete.isConfirmed) {
            setFeedbackList((prev) =>
                prev.filter((f) => f.feedback_feedback_id !== id)
            );
            try {
                await axios.delete(`https://mazedakhale.in/api/feedback/${id}`);
                Swal.fire("Deleted!", "Feedback has been deleted.", "success");
            } catch (err) {
                console.error("Error deleting feedback:", err);
                Swal.fire("Error", "Failed to delete feedback", "error");
            }
        }
    };

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300 overflow-hidden">
                {/* Header */}
                <div className="border-t-4 border-orange-400 bg-[#F4F4F4] text-center p-4 rounded-t-lg relative">
                    <h2 className="text-2xl font-bold text-gray-800">Feedback List</h2>
                    <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-gray-300 shadow-md" />
                </div>

                {/* Table */}
                <div className="p-6 overflow-x-auto">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {["Name", "Role", "Comment", "Rating", "Update", "Action"].map(
                                    (header, idx) => (
                                        <th
                                            key={idx}
                                            className="px-4 py-3 border border-[#776D6DA8] text-center font-semibold"
                                        >
                                            {header}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackList.length > 0 ? (
                                feedbackList.map((fb, idx) => (
                                    <tr
                                        key={fb.feedback_feedback_id}
                                        className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"
                                            } hover:bg-orange-100 transition duration-200`}
                                    >
                                        {/* Show/Not Show toggle */}


                                        <td className="px-4 py-3 border text-center">
                                            {fb.users_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 border text-center">
                                            {fb.users_role || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 border text-center">
                                            {fb.feedback_comment}
                                        </td>
                                        <td className="px-4 py-3 border text-center">
                                            {[...Array(fb.feedback_rating)].map((_, i) => (
                                                <StarIcon key={i} color="warning" />
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 border text-center">
                                            <button
                                                className={`px-2 py-1 rounded ${fb.status ? "bg-green-500 text-white" : "bg-gray-200"
                                                    }`}
                                                onClick={() => handleStatusClick(fb)}
                                            >
                                                {fb.status ? "Hide" : "Show"}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 border text-center">
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                onClick={() =>
                                                    handleDelete(fb.feedback_feedback_id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-4 py-3 border border-[#776D6DA8] text-center"
                                    >
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
