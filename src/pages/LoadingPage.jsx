import { useState, useEffect } from "react";
import "./LoadingPage.css";

const LoadingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Connecting to Telegram",
    "Fetching channel data",
    "Analyzing posts & views",
    "Processing reactions",
    "Calculating engagement metrics",
    "Generating your insights",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000); // Slower step progression to match backend processing time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="gradient-bg"></div>

      <div className="loading-page-content">
        <div className="loading-header">
          <h2 className="loading-title animate-fade-in">
            Unwrapping your channel...
          </h2>
          <p className="loading-subtitle animate-fade-in">
            Analyzing your content. This may take a minute or two.
          </p>
        </div>

        <div className="loading-visual">
          {/* Loading spinner */}
          <div className="spinner-container">
            <div className="spinner-large"></div>
          </div>
        </div>

        <div className="loading-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`loading-step ${
                index <= currentStep ? "active" : ""
              } ${index < currentStep ? "completed" : ""}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="step-indicator">
                {index < currentStep ? (
                  <span className="checkmark">✓</span>
                ) : index === currentStep ? (
                  <span className="spinner-small"></span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
