import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import jwtDecode from "jwt-decode";

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
            const response = await axios.get("https://vm.q1prh3wrjc0aw.ap-south-1.cs.amazonlightsail.com/feedback");
            setFeedbackList(response.data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    return (
        <Paper
            elevation={3}
            style={{
                maxWidth: "900px",
                margin: "100px auto",
                padding: "20px",
            }}
        >
            <Typography variant="h5" gutterBottom textAlign="center">
                Feedback List
            </Typography>

            {feedbackList.length === 0 ? (
                <Typography textAlign="center" color="textSecondary">
                    No feedback available.
                </Typography>
            ) : (
                <TableContainer
                    component={Paper}
                    style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><strong>User ID</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell><strong>Comment</strong></TableCell>
                                <TableCell><strong>Rating</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feedbackList.map((feedback) => (
                                <TableRow key={feedback.feedback_feedback_id}>
                                    <TableCell>{feedback.feedback_user_id}</TableCell>
                                    <TableCell>{feedback.users_name || "N/A"}</TableCell>
                                    <TableCell>{feedback.users_role || "N/A"}</TableCell>
                                    <TableCell>{feedback.feedback_comment}</TableCell>
                                    <TableCell>
                                        {[...Array(feedback.feedback_rating)].map((_, i) => (
                                            <StarIcon key={i} color="warning" />
                                        ))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default FeedbackList;
