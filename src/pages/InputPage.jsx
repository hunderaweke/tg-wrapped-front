import { useState } from "react";
import Button from "../components/Button";
import "./InputPage.css";

const InputPage = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Remove @ if user included it
    const cleanUsername = username.trim().replace("@", "");

    if (!cleanUsername) {
      setError("Please enter a channel username");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    onSubmit(cleanUsername);
  };

  return (
    <div className="page">
      <div className="gradient-bg"></div>

      <div className="input-page-content animate-fade-in">
        <div className="branding">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4ff"/>
                  <stop offset="1" stopColor="#00ffcc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="main-title">
            <span className="telegram-text">Telegram</span>
            <span className="unwrapped-text">Unwrapped</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="form-group">
            <label htmlFor="username" className="input-label">
              Channel username
            </label>
            <input
              id="username"
              type="text"
              className={`input ${error ? "input-error" : ""}`}
              placeholder="e.g. @channelname"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          <Button type="submit" variant="primary">
            Unwrap Channel
          </Button>

          <p className="info-text">
            <span className="info-icon">ⓘ</span>
            We access public data from the last 12 months.
            <br />
            Processing may take 1-2 minutes. No login required.
          </p>
        </form>
      </div>
    </div>
  );
};

export default InputPage;
