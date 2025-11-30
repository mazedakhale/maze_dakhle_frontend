// API Configuration
// Change this single value to switch between development and production

// For development (local backend)
// const API_BASE_URL = "http://localhost:3000";

// For production (deployed backend)
const API_BASE_URL = "/api";

// You can also use environment variables for automatic switching
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default API_BASE_URL;