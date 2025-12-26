import { useState } from 'react';
import Button from '../components/Button';
import './InputPage.css';

const InputPage = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Remove @ if user included it
    const cleanUsername = username.trim().replace('@', '');

    if (!cleanUsername) {
      setError('Please enter a channel username');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    onSubmit(cleanUsername);
  };

  return (
    <div className="page">
      <div className="gradient-bg"></div>
      
      <div className="input-page-content animate-fade-in">
        <div className="branding">
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
              className={`input ${error ? 'input-error' : ''}`}
              placeholder="e.g. @channelname"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
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
            No login required.
          </p>
        </form>
      </div>
    </div>
  );
};

export default InputPage;
