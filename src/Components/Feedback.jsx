import React, { useState, useEffect } from "react";
import axios from "axios";
import { Paper, Typography, Button, IconButton } from "@mui/material";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import jwtDecode from "jwt-decode"; // To decode token

const Feedback = () => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode token to get user data
        setUser(decoded);
        localStorage.setItem("user", JSON.stringify(decoded)); // Store in local storage
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Submit Feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment || rating < 1 || rating > 5) {
      alert("Please enter a valid comment and select a rating.");
      return;
    }

    // Retrieve user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.user_id) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    try {
      await axios.post("https://mazedakhale.in/api/feedback", {
        comment,
        rating,
        user_id: storedUser.user_id, // ✅ Extract user_id correctly
      });

      alert("Feedback submitted successfully!");
      setComment("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <Paper
        elevation={3}
        style={{
          width: "600px",
          padding: "30px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Header Bar with Triangle */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "20%",
            transform: "translateX(-50%)",
            backgroundColor: "#f48236",
            width: "250px",
            padding: "10px",
            textAlign: "center",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            // borderRadius: "5px",
          }}
        >
          Give your Feedback
          {/* Triangle */}
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "0",
              height: "0",
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "15px solid #f48236",
            }}
          ></div>
        </div>
        <div className="relative border-t-4 p-4 rounded-t-lg">
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {/* User Name */}
        {user ? (
          <Typography
            style={{
              textAlign: "left",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {user.name}
          </Typography>
        ) : (
          <Typography color="error">User not logged in!</Typography>
        )}

        {/* Feedback Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            style={{
              width: "100%",
              height: "100px",
              padding: "10px",
              fontSize: "16px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />

          {/* Star Rating */}
          <div style={{ marginBottom: "15px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setRating(star)}
                style={{ color: star <= rating ? "#FFD700" : "#ccc" }}
              >
                <StarIcon />
              </IconButton>
            ))}
          </div>

          <Button
            type="submit"
            variant="contained"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
            }}
          >
            Submit Feedback
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Feedback;
