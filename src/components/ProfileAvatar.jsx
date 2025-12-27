import React from "react";
import "./ProfileAvatar.css";

const ProfileAvatar = ({
  src,
  alt,
  channelName,
  size = "large",
  showOverlay = false,
}) => {
  // Generate a color based on channel name for fallback
  const getColorFromName = (name) => {
    if (!name) return "#00d4ff";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const fallbackColor = getColorFromName(channelName);
  const initials = channelName
    ? channelName.substring(0, 2).toUpperCase()
    : "??";

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`profile-avatar avatar-${size}`}>
      <div className="avatar-glow" style={{ background: fallbackColor }}></div>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || channelName}
          className="avatar-img"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="avatar-fallback" style={{ background: fallbackColor }}>
          {initials}
        </div>
      )}
      {showOverlay && (
        <div className="avatar-overlay">
          <span className="santa-hat">🎅</span>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
