import ProfileAvatar from "../components/ProfileAvatar";
import Button from "../components/Button";
import "./LandingPage.css";

const LandingPage = ({ channelName, channelProfile, onContinue }) => {
  return (
    <div className="page">
      <div className="gradient-bg"></div>

      <div className="landing-page-content">
        {/* Profile Section */}
        <div className="profile-section">
          <ProfileAvatar
            src={channelProfile}
            channelName={channelName}
            size="large"
            showOverlay={true}
          />
          <div className="channel-info">
            <h2 className="channel-name">{channelName}</h2>
            <p className="channel-handle">
              @{channelName.toLowerCase().replace(/\s+/g, "")}
            </p>
          </div>
        </div>

        {/* Main Title */}
        <div className="recap-header">
          <h1 className="year">2025</h1>
          <h1 className="recap-text">Recap</h1>
        </div>

        {/* Tagline */}
        <p className="tagline">
          Here's how{" "}
          <span className="highlight">
            @{channelName.toLowerCase().replace(/\s+/g, "")}
          </span>{" "}
          performed this year!
        </p>

        {/* CTA Button */}
        <Button onClick={onContinue} variant="primary">
          See Your Stats
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
