import { useState, useEffect } from 'react';
import './LoadingPage.css';

const LoadingPage = ({ channelName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Counting posts',
    'Analyzing views',
    'Calculating engagement',
    'Processing reactions',
    'Generating insights'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

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
            Good things take a moment
          </p>
        </div>

        <div className="loading-visual">
          {/* Simulated blurred content in background */}
          <div className="background-blur">
            <div className="blur-content"></div>
          </div>

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
                index <= currentStep ? 'active' : ''
              } ${index < currentStep ? 'completed' : ''}`}
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
