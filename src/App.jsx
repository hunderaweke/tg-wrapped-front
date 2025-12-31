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
      // The backend will take time to process, so we wait for it
      const data = await getChannelAnalytics(username);

      // Validate the response structure
      if (
        !data ||
        !data.channel_name ||
        !data.totals ||
        !data.trends ||
        !data.highlights
      ) {
        throw new Error("Invalid response structure from backend");
      }

      setChannelData(data);

      // Show loading for at least 2 seconds for better UX (backend already takes time)
      setTimeout(() => {
        setCurrentPage("landing");
      }, 2000);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch channel analytics. Try "demo" to see sample data.'
      );
      setCurrentPage("input");
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
