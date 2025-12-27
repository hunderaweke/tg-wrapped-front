import axios from "axios";

export const API_BASE_URL = "http://localhost:7000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds for processing
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
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Error:", error.message);
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
