import { useState } from "react";
import InputPage from "./pages/InputPage";
import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import ResultsPage from "./pages/ResultsPage";
import { getChannelAnalytics, API_BASE_URL } from "./services/api";
import "./App.css";

// Import mock data for demo
import mockData from "../response.json";

function App() {
  const [currentPage, setCurrentPage] = useState("input"); // input, loading, landing, results
  const [channelData, setChannelData] = useState(null);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  const handleUsernameSubmit = async (username) => {
    setCurrentPage("loading");
    setError(null);

    // Use mock data if backend is not available (for demo purposes)
    if (useMockData || username.toLowerCase() === "demo") {
      setTimeout(() => {
        setChannelData(mockData);
        setCurrentPage("landing");
      }, 2000);
      return;
    }

    try {
      const data = await getChannelAnalytics(username);
      setChannelData(data);

      // Show loading for at least 3 seconds for better UX
      setTimeout(() => {
        setCurrentPage("landing");
      }, 3000);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(
        err.response?.data?.message ||
          'Failed to fetch channel analytics. Try "demo" to see sample data.'
      );
      setCurrentPage("input");
      setUseMockData(true); // Enable mock data fallback
    }
  };

  const handleContinueToResults = () => {
    setCurrentPage("results");
  };

  return (
    <div className="app">
      {currentPage === "input" && <InputPage onSubmit={handleUsernameSubmit} />}

      {currentPage === "loading" && <LoadingPage />}

      {currentPage === "landing" && channelData && (
        <LandingPage
          channelName={channelData.channel_name}
          channelProfile={
            channelData.channel_profile
              ? `${API_BASE_URL}${channelData.channel_profile}`
              : null
          }
          onContinue={handleContinueToResults}
        />
      )}

      {currentPage === "results" && channelData && (
        <ResultsPage data={channelData} />
      )}

      {error && (
        <div className="error-toast">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
