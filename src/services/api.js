import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 120000, // Default 120 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error("API Error:", error.response.data);

      // Try to extract error message from backend response
      const backendMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.detail;

      // Enhance error message based on status code
      if (error.response.status === 404) {
        error.message =
          backendMessage ||
          "Channel not found. Please check the username and try again.";
        error.type = "not_found";
      } else if (error.response.status === 429) {
        error.message =
          backendMessage ||
          "Too many requests. Please try again in a few minutes.";
        error.type = "rate_limit";
      } else if (error.response.status === 400) {
        error.message =
          backendMessage || "Invalid request. Please check your input.";
        error.type = "validation";
      } else if (error.response.status === 500) {
        error.message =
          backendMessage ||
          "Server error. The backend is having trouble processing your request.";
        error.type = "server_error";
      } else if (error.response.status === 503) {
        error.message =
          backendMessage ||
          "Service temporarily unavailable. Please try again later.";
        error.type = "unavailable";
      } else {
        error.message =
          backendMessage || "An unexpected error occurred. Please try again.";
        error.type = "unknown";
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
      error.message =
        "Cannot connect to server. Please check if the backend is running.";
      error.type = "network";
    } else if (error.code === "ECONNABORTED") {
      // Timeout error
      error.message =
        "Request timed out. The channel might be too large or the server is busy.";
      error.type = "timeout";
    } else {
      // Something else happened
      console.error("Error:", error.message);
      error.type = "unknown";
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch analytics for a Telegram channel
 * @param {string} username - Channel username (without @)
 * @returns {Promise} - Analytics data
 */
export const getChannelAnalytics = async (username) => {
  try {
    const payload = { username: username };
    console.log("Sending request to /analytics with payload:", payload);
    console.log("Username value:", username);

    const response = await apiClient.post("/analytics", payload);
    console.log("Received response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error("Full error:", error);
    throw error;
  }
};

export default apiClient;
