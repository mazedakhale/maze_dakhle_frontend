import React, { useState, useEffect } from "react";
import axios from "axios";
import { Paper, Typography, Button, IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import jwtDecode from "jwt-decode"; // To decode token

const Feedback = () => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [user, setUser] = useState(null);

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
            await axios.post("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/feedback", {
                comment,
                rating,
                user_id: storedUser.user_id,  // ✅ Extract user_id correctly
            });

            alert("Feedback submitted successfully!");
            setComment("");
            setRating(0);
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };


    return (
        <Paper
            elevation={3}
            style={{
                maxWidth: "500px",
                margin: "100px auto",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <Typography variant="h5" gutterBottom>Give Your Feedback</Typography>

            {!user ? (
                <Typography color="error">User not logged in!</Typography>
            ) : (
                <>
                    <Typography variant="subtitle1">{user.name} ({user.role})</Typography>

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
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                            }}
                        />

                        {/* Star Rating */}
                        <div style={{ marginBottom: "10px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconButton key={star} onClick={() => setRating(star)} color={star <= rating ? "warning" : "default"}>
                                    <StarIcon />
                                </IconButton>
                            ))}
                        </div>

                        <Button type="submit" variant="contained" color="primary">
                            Submit Feedback
                        </Button>
                    </form>
                </>
            )}
        </Paper>
    );
};

export default Feedback;
