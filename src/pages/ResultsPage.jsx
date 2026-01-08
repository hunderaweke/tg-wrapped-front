import { useRef, useEffect, useState } from "react";
import { domToPng } from "modern-screenshot";
import ProfileAvatar from "../components/ProfileAvatar";
import StatCard from "../components/StatCard";
import HeatMap from "../components/HeatMap";
import MonthlyChart from "../components/MonthlyChart";
import { API_BASE_URL } from "../services/api";
import "./ResultsPage.css";

// Format large numbers with K, M, B suffixes
const formatLargeNumber = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 100_000) {
    return (num / 1_000).toFixed(0) + "K";
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
};

// Check if number is abbreviated
const isAbbreviated = (num) => num >= 10_000;

// Component for numbers with tooltips
const NumberWithTooltip = ({ value, suffix = "" }) => {
  const formatted = formatLargeNumber(value);
  const showTooltip = isAbbreviated(value);
  const exact = value.toLocaleString();

  return (
    <span
      className="number-with-tooltip"
      title={showTooltip ? `Exact: ${exact}` : undefined}
    >
      {formatted}
      {suffix}
      {showTooltip && <span className="exact-tooltip">{exact}</span>}
    </span>
  );
};

const ResultsPage = ({ data, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingSection, setDownloadingSection] = useState(null);

  // Refs for each section
  const landingRef = useRef(null);
  const statsRef = useRef(null);
  const forwardedRef = useRef(null);
  const topPostsRef = useRef(null);
  const dailyHeatmapRef = useRef(null);
  const monthlyViewsRef = useRef(null);
  const monthlyPostsRef = useRef(null);
  const hourlyRef = useRef(null);
  const highlightsRef = useRef(null);
  const reactionsRef = useRef(null);

  if (!data) {
    return (
      <div className="results-page">
        <div className="gradient-bg"></div>
        <div className="results-container">
          <p style={{ color: "white", textAlign: "center", padding: "2rem" }}>
            No data available
          </p>
        </div>
      </div>
    );
  }

  const { channel_name, channel_profile, totals, trends, highlights } = data;

  const topReactions = Object.entries(highlights.reactions_by_type)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const profilePhotoUrl = channel_profile
    ? `${API_BASE_URL}${channel_profile}`
    : null;

  const downloadImage = async (element, filename) => {
    if (!element) return null;

    try {
      // Pre-process: ensure bars have explicit heights from CSS variable
      const bars = element.querySelectorAll(".bar");
      const originalStyles = [];

      bars.forEach((bar) => {
        // Store original inline styles
        originalStyles.push({
          element: bar,
          height: bar.style.height,
          transition: bar.style.transition,
        });

        // Get the --height CSS variable value and apply it directly
        const heightVar = bar.style.getPropertyValue("--height");
        if (heightVar) {
          bar.style.height = heightVar;
        }
        // Disable transition to ensure immediate height
        bar.style.transition = "none";
      });

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#0a0f1a",
      });

      // Restore original styles
      originalStyles.forEach(({ element: el, height, transition }) => {
        el.style.height = height;
        el.style.transition = transition;
      });

      return { dataUrl, filename };
    } catch (error) {
      console.error(`Error capturing ${filename}:`, error);
      return null;
    }
  };

  const handleDownloadSection = async (ref, name) => {
    if (!ref.current) return;
    setDownloadingSection(name);

    const result = await downloadImage(ref.current, name);
    if (result) {
      const link = document.createElement("a");
      link.download = `${result.filename}.png`;
      link.href = result.dataUrl;
      link.click();
    }

    setDownloadingSection(null);
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const sections = [
      { ref: landingRef, name: `${channel_name}-landing` },
      { ref: statsRef, name: `${channel_name}-stats` },
      { ref: forwardedRef, name: `${channel_name}-forwarded` },
      { ref: topPostsRef, name: `${channel_name}-top-posts` },
      { ref: dailyHeatmapRef, name: `${channel_name}-daily-activity` },
      { ref: monthlyViewsRef, name: `${channel_name}-monthly-views` },
      { ref: monthlyPostsRef, name: `${channel_name}-monthly-posts` },
      { ref: hourlyRef, name: `${channel_name}-hourly-activity` },
      { ref: highlightsRef, name: `${channel_name}-highlights` },
      { ref: reactionsRef, name: `${channel_name}-reactions` },
    ].filter((section) => section.ref.current);

    const totalSections = sections.length;
    const images = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const result = await downloadImage(section.ref.current, section.name);
      if (result) {
        images.push(result);
      }
      setDownloadProgress(Math.round(((i + 1) / totalSections) * 100));
    }

    // Download all images
    for (const image of images) {
      const link = document.createElement("a");
      link.download = `${image.filename}.png`;
      link.href = image.dataUrl;
      link.click();
      // Small delay between downloads to prevent browser blocking
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsDownloading(false);
    setDownloadProgress(0);
  };

  const DownloadSectionButton = ({ sectionRef, sectionName }) => (
    <button
      className="download-section-button"
      onClick={() =>
        handleDownloadSection(sectionRef, `${channel_name}-${sectionName}`)
      }
      disabled={downloadingSection === `${channel_name}-${sectionName}`}
      aria-label={`Download ${sectionName}`}
      title="Download this section"
    >
      {downloadingSection === `${channel_name}-${sectionName}` ? (
        <svg className="download-spinner" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="32"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 15V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="results-page">
      <div className="gradient-bg"></div>

      <div className="results-container">
        <div className="results-actions">
          <button
            className="back-button"
            onClick={onBack}
            aria-label="Go back to home"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>

          <button
            className="download-all-button"
            onClick={handleDownloadAll}
            disabled={isDownloading}
            aria-label="Download all sections as images"
          >
            {isDownloading ? (
              <>
                <svg
                  className="download-spinner"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="32"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{downloadProgress}%</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Download All</span>
              </>
            )}
          </button>
        </div>

        {/* Landing Preview for Screenshot */}
        <div ref={landingRef} className="landing-preview screenshot-section">
          <div className="landing-preview-content">
            <ProfileAvatar
              src={profilePhotoUrl}
              channelName={channel_name}
              size="large"
            />
            <div className="landing-preview-info">
              <h2 className="landing-preview-name">{channel_name}</h2>
              <p className="landing-preview-handle">
                @{channel_name.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
            <div className="landing-preview-title">
              <span className="landing-year">2025</span>
              <span className="landing-recap">Recap</span>
            </div>
            <p className="landing-preview-tagline">
              Here's how{" "}
              <span className="highlight">
                @{channel_name.toLowerCase().replace(/\s+/g, "")}
              </span>{" "}
              performed this year!
            </p>
          </div>
          <DownloadSectionButton
            sectionRef={landingRef}
            sectionName="landing"
          />
        </div>

        {/* Total Stats Grid */}
        <section ref={statsRef} className="stats-section screenshot-section">
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">📈 Overall Performance</h2>
              <p className="section-description">
                Your channel's key metrics at a glance
              </p>
            </div>
            <DownloadSectionButton sectionRef={statsRef} sectionName="stats" />
          </div>
          <div className="stats-grid">
            <StatCard
              title="Total Views"
              value={totals.total_views}
              icon="👀"
              delay={0}
            />
            <StatCard
              title="Total Posts"
              value={totals.total_posts}
              icon="📝"
              delay={100}
            />
            <StatCard
              title="Total Reactions"
              value={totals.total_reactions}
              icon="❤️"
              delay={200}
            />
            <StatCard
              title="Total Comments"
              value={totals.total_comments}
              icon="💬"
              delay={300}
            />
          </div>
        </section>

        {/* Most Forwarded From */}
        {highlights.most_forwarded_source && (
          <section
            ref={forwardedRef}
            className="forwarded-section screenshot-section"
          >
            <div className="section-header-with-download">
              <div className="section-header">
                <h2 className="section-title">📤 Most Forwarded From</h2>
                <p className="section-description">
                  The channel you shared content from the most
                </p>
              </div>
              <DownloadSectionButton
                sectionRef={forwardedRef}
                sectionName="forwarded"
              />
            </div>
            <div className="forwarded-card glass-card">
              <div className="forwarded-content">
                {highlights.most_forwarded_source.profile && (
                  <ProfileAvatar
                    src={`${API_BASE_URL}${highlights.most_forwarded_source.profile}`}
                    channelName={highlights.most_forwarded_source.name}
                    size="medium"
                  />
                )}
                <div className="forwarded-info">
                  <h3 className="forwarded-name">
                    {highlights.most_forwarded_source.name ||
                      highlights.most_forwarded_source.username}
                  </h3>
                  {highlights.most_forwarded_source.username && (
                    <p className="forwarded-username">
                      @{highlights.most_forwarded_source.username}
                    </p>
                  )}
                  <div className="forwarded-stat">
                    <span className="forwarded-count">
                      {highlights.most_forwarded_source.forwards_count}
                    </span>
                    <span className="forwarded-label">posts forwarded</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Top Posts - Most Viewed & Most Commented */}
        <section
          ref={topPostsRef}
          className="top-posts-section screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">🏆 Top Performing Posts</h2>
              <p className="section-description">
                Your most engaging content that resonated with the audience
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={topPostsRef}
              sectionName="top-posts"
            />
          </div>

          <div className="top-posts-grid">
            {/* Most Viewed Post */}
            {highlights.most_viewed && (
              <div className="top-post-card glass-card">
                <div className="top-post-header">
                  <div
                    className="top-post-badge"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <span className="badge-icon">👁️</span>
                    <span className="badge-text">Most Viewed</span>
                  </div>
                  <div className="top-post-stats">
                    <div className="stat-item">
                      <span className="stat-value">
                        <NumberWithTooltip
                          value={highlights.most_viewed.views}
                        />
                      </span>
                      <span className="stat-label">views</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {highlights.most_viewed.comments}
                      </span>
                      <span className="stat-label">comments</span>
                    </div>
                  </div>
                </div>
                <div className="top-post-content">
                  <p className="post-text">
                    {highlights.most_viewed.text.length > 280
                      ? highlights.most_viewed.text.substring(0, 280) + "..."
                      : highlights.most_viewed.text}
                  </p>
                </div>
                <div className="top-post-footer">
                  <span className="post-date">
                    📅{" "}
                    {new Date(highlights.most_viewed.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Most Commented Post */}
            {highlights.most_commented && (
              <div className="top-post-card glass-card">
                <div className="top-post-header">
                  <div
                    className="top-post-badge"
                    style={{
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    }}
                  >
                    <span className="badge-icon">💬</span>
                    <span className="badge-text">Most Discussed</span>
                  </div>
                  <div className="top-post-stats">
                    <div className="stat-item">
                      <span className="stat-value">
                        {highlights.most_commented.comments}
                      </span>
                      <span className="stat-label">comments</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        <NumberWithTooltip
                          value={highlights.most_commented.views}
                        />
                      </span>
                      <span className="stat-label">views</span>
                    </div>
                  </div>
                </div>
                <div className="top-post-content">
                  <p className="post-text">
                    {highlights.most_commented.text.length > 280
                      ? highlights.most_commented.text.substring(0, 280) + "..."
                      : highlights.most_commented.text}
                  </p>
                </div>
                <div className="top-post-footer">
                  <span className="post-date">
                    📅{" "}
                    {new Date(
                      highlights.most_commented.date
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Posting Activity Heat Map */}
        <section
          ref={dailyHeatmapRef}
          className="visualization-section glass-card heatmap-section screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">📅 Daily Posting Activity</h2>
              <p className="section-description">
                Track your content creation journey throughout 2025
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={dailyHeatmapRef}
              sectionName="daily-activity"
            />
          </div>
          <HeatMap data={trends.posts_by_day} type="daily" />
        </section>

        {/* Monthly Views Chart */}
        <section
          ref={monthlyViewsRef}
          className="visualization-section glass-card monthly-section screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">👁️ Monthly View Trends</h2>
              <p className="section-description">
                See how your audience engagement evolved each month
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={monthlyViewsRef}
              sectionName="monthly-views"
            />
          </div>
          <MonthlyChart
            data={trends.views_by_month}
            title="Monthly Views Distribution"
            type="views"
          />
        </section>

        {/* Monthly Posts Chart */}
        <section
          ref={monthlyPostsRef}
          className="visualization-section glass-card monthly-section screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">📊 Monthly Post Volume</h2>
              <p className="section-description">
                Your content creation frequency across the year
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={monthlyPostsRef}
              sectionName="monthly-posts"
            />
          </div>
          <MonthlyChart
            data={trends.posts_by_month}
            title="Monthly Posts Distribution"
            type="posts"
          />
        </section>

        {/* Hourly Posting Pattern */}
        <section
          ref={hourlyRef}
          className="visualization-section glass-card screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">⏰ Peak Activity Hours</h2>
              <p className="section-description">
                Discover your optimal posting times throughout the day
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={hourlyRef}
              sectionName="hourly-activity"
            />
          </div>
          <HeatMap data={trends.posts_by_hour} type="hourly" />
        </section>

        {/* More Highlights */}
        <section
          ref={highlightsRef}
          className="highlights-section screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">✨ More Highlights</h2>
              <p className="section-description">
                Additional achievements and milestones
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={highlightsRef}
              sectionName="highlights"
            />
          </div>
          <div className="highlights-grid">
            <div className="highlight-card glass-card">
              <div className="highlight-icon">🔥</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Posting Streak</h3>
                <p className="highlight-value">
                  {trends.longest_posting_streak} days
                </p>
                <p className="highlight-meta">Longest consecutive posting</p>
              </div>
            </div>

            <div className="highlight-card glass-card">
              <div className="highlight-icon">↗️</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Total Forwards</h3>
                <p className="highlight-value">
                  <NumberWithTooltip value={totals.total_forwards} />
                </p>
                <p className="highlight-meta">Times your content was shared</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Reactions */}
        <section
          ref={reactionsRef}
          className="reactions-section glass-card screenshot-section"
        >
          <div className="section-header-with-download">
            <div className="section-header">
              <h2 className="section-title">💝 Audience Reactions</h2>
              <p className="section-description">
                The emotions your content sparked in your community
              </p>
            </div>
            <DownloadSectionButton
              sectionRef={reactionsRef}
              sectionName="reactions"
            />
          </div>
          <div className="reactions-grid">
            {topReactions.map(([emoji, count], index) => (
              <div
                key={emoji}
                className="reaction-item"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  "--animation-delay": `${index * 0.3}s`,
                }}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">
                  <NumberWithTooltip value={count} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="results-footer">
          <p>Generated with Telegram Unwrapped • 2025</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
