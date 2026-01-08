import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import InputPage from "./pages/InputPage";
import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import ResultsPage from "./pages/ResultsPage";
import { getChannelAnalytics, API_BASE_URL } from "./services/api";
import "./App.css";

import mockData from "../response.json";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("input");
  const [channelData, setChannelData] = useState(null);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [hasVisitedLanding, setHasVisitedLanding] = useState(false);

  useState(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUsernameSubmit = async (username) => {
    setCurrentPage("loading");
    setError(null);

    if (useMockData || username.toLowerCase() === "demo") {
      setTimeout(() => {
        setChannelData(mockData);
        setCurrentPage("landing");
        navigate("/landing");
      }, 2000);
      return;
    }

    try {
      const data = await getChannelAnalytics(username);

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

      setTimeout(() => {
        setCurrentPage("landing");
        navigate("/landing");
      }, 2000);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch channel analytics. Try "demo" to see sample data.'
      );
      setCurrentPage("input");
      navigate("/");
    }
  };

  const handleContinueToResults = () => {
    setHasVisitedLanding(true);
    setCurrentPage("results");
    navigate("/results");
  };

  const handleBackToHome = () => {
    setCurrentPage("input");
    setChannelData(null);
    setError(null);
    setHasVisitedLanding(false);
    navigate("/");
  };

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            currentPage === "loading" ? (
              <LoadingPage />
            ) : (
              <InputPage onSubmit={handleUsernameSubmit} />
            )
          }
        />
        <Route
          path="/landing"
          element={
            channelData ? (
              <LandingPage
                channelName={channelData.channel_name}
                channelProfile={
                  channelData.channel_profile
                    ? `${API_BASE_URL}${channelData.channel_profile}`
                    : null
                }
                onContinue={handleContinueToResults}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/results"
          element={
            channelData && hasVisitedLanding ? (
              <ResultsPage data={channelData} onBack={handleBackToHome} />
            ) : channelData ? (
              <Navigate to="/landing" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {error && (
        <div className="error-toast">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <p className="error-message">{error}</p>
          </div>
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
