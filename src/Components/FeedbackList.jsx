import React, { useState, useEffect } from "react";
import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaTag, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const API_BASE = "https://mazedakhale.in/api/feedback";

const FeedbackList = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  // Decode user from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        localStorage.removeItem("token");
      }
    }
    fetchFeedback();
  }, []);

  // Fetch feedback and unify status field
  const fetchFeedback = async () => {
    try {
      const { data } = await axios.get(API_BASE);
      // TypeORM raw results prefix with feedback_ alias
      const normalized = data.map((f) => ({
        ...f,
        status: f.feedback_status ?? f.status,
      }));
      setFeedbackList(normalized);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  // Toggle display status via PATCH
  const handleStatusToggle = async (id, newStatus) => {
    // optimistic UI
    setFeedbackList((prev) =>
      prev.map((f) =>
        f.feedback_feedback_id === id ? { ...f, status: newStatus } : f
      )
    );

    try {
      // ← use a plain template literal, no leading 'l' and no extra spaces
      await axios.patch(`${API_BASE}/status/${id}`, { status: newStatus });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Feedback will ${
          newStatus === 1 ? "be shown" : "no longer be shown"
        }`,
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Status update failed:", err);
      // rollback
      setFeedbackList((prev) =>
        prev.map((f) =>
          f.feedback_feedback_id === id ? { ...f, status: newStatus ^ 1 } : f
        )
      );
      Swal.fire("Error", "Could not update status.", "error");
    }
  };

  // Confirm then toggle
  const handleStatusClick = (feedback) => {
    const newStatus = feedback.status === 1 ? 0 : 1;
    Swal.fire({
      title:
        newStatus === 1
          ? "Display this feedback on the main page?"
          : "Hide this feedback from the main page?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: newStatus === 1 ? "Show" : "Hide",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusToggle(feedback.feedback_feedback_id, newStatus);
      }
    });
  };

  // Delete with code confirm
  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Enter Deletion Code",
      input: "password",
      inputPlaceholder: "Code...",
      showCancelButton: true,
      confirmButtonText: "Delete",
      preConfirm: (code) => {
        if (code !== "0000") Swal.showValidationMessage("Wrong code");
      },
    });
    if (!isConfirmed) return;

    setFeedbackList((prev) =>
      prev.filter((f) => f.feedback_feedback_id !== id)
    );
    try {
      await axios.delete(`${API_BASE}/${id}`);
      Swal.fire("Deleted", "Feedback removed.", "success");
    } catch {
      Swal.fire("Error", "Failed to delete.", "error");
      fetchFeedback();
    }
  };

  return (
    <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-hidden">
      <div className="bg-white shadow-lg rounded-lg border overflow-hidden">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Feedback List
          </h2>
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Adashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full bg-white text-sm border border-[#776D6DA8] rounded-md shadow-md">
            <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
              <tr>
                {["Name", "Role", "Comment", "Rating", "Update", "Action"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 border text-center font-semibold"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {feedbackList.length ? (
                feedbackList.map((fb, idx) => (
                  <tr
                    key={fb.feedback_feedback_id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100`}
                  >
                    <td className="px-4 py-3 border text-center">
                      {fb.users_name}
                    </td>
                    <td className="px-4 py-3 border text-center">
                      {fb.users_role}
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
                        className={`px-2 py-1 rounded ${
                          fb.status === 1
                            ? "bg-green-500 text-white"
                            : "bg-gray-200"
                        }`}
                        onClick={() => handleStatusClick(fb)}
                      >
                        {fb.status === 1 ? "Hide" : "Show"}
                      </button>
                    </td>
                    <td className="px-4 py-3 border text-center">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(fb.feedback_feedback_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3 border text-center">
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
