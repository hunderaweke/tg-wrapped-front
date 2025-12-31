import { useRef, useEffect, useState } from "react";
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

const ResultsPage = ({ data }) => {
  // Ensure data exists with default values
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

  // Top reactions
  const topReactions = Object.entries(highlights.reactions_by_type)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Construct full profile photo URL if channel_profile exists
  const profilePhotoUrl = channel_profile
    ? `${API_BASE_URL}${channel_profile}`
    : null;

  return (
    <div className="results-page">
      <div className="gradient-bg"></div>

      <div className="results-container">
        {/* Header */}
        <div className="results-header animate-fade-in">
          <div className="header-content">
            <ProfileAvatar
              src={profilePhotoUrl}
              channelName={channel_name}
              size="medium"
            />
            <div>
              <h1 className="channel-title">{channel_name}</h1>
              <p className="channel-subtitle">Your Channel, Unwrapped</p>
            </div>
          </div>
        </div>

        {/* Total Stats Grid */}
        <section className="stats-section">
          <div className="section-header">
            <h2 className="section-title">📈 Overall Performance</h2>
            <p className="section-description">
              Your channel's key metrics at a glance
            </p>
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
          <section className="forwarded-section">
            <div className="section-header">
              <h2 className="section-title">📤 Most Forwarded From</h2>
              <p className="section-description">
                The channel you shared content from the most
              </p>
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
        <section className="top-posts-section">
          <div className="section-header">
            <h2 className="section-title">🏆 Top Performing Posts</h2>
            <p className="section-description">
              Your most engaging content that resonated with the audience
            </p>
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
        <section className="visualization-section glass-card heatmap-section">
          <div className="section-header">
            <h2 className="section-title">📅 Daily Posting Activity</h2>
            <p className="section-description">
              Track your content creation journey throughout 2025
            </p>
          </div>
          <HeatMap data={trends.posts_by_day} type="daily" />
        </section>

        {/* Monthly Views Chart */}
        <section className="visualization-section glass-card monthly-section">
          <div className="section-header">
            <h2 className="section-title">👁️ Monthly View Trends</h2>
            <p className="section-description">
              See how your audience engagement evolved each month
            </p>
          </div>
          <MonthlyChart
            data={trends.views_by_month}
            title="Monthly Views Distribution"
            type="views"
          />
        </section>

        {/* Monthly Posts Chart */}
        <section className="visualization-section glass-card monthly-section">
          <div className="section-header">
            <h2 className="section-title">📊 Monthly Post Volume</h2>
            <p className="section-description">
              Your content creation frequency across the year
            </p>
          </div>
          <MonthlyChart
            data={trends.posts_by_month}
            title="Monthly Posts Distribution"
            type="posts"
          />
        </section>

        {/* Hourly Posting Pattern */}
        <section className="visualization-section glass-card">
          <div className="section-header">
            <h2 className="section-title">⏰ Peak Activity Hours</h2>
            <p className="section-description">
              Discover your optimal posting times throughout the day
            </p>
          </div>
          <HeatMap data={trends.posts_by_hour} type="hourly" />
        </section>

        {/* More Highlights */}
        <section className="highlights-section">
          <div className="section-header">
            <h2 className="section-title">✨ More Highlights</h2>
            <p className="section-description">
              Additional achievements and milestones
            </p>
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
        <section className="reactions-section glass-card">
          <div className="section-header">
            <h2 className="section-title">💝 Audience Reactions</h2>
            <p className="section-description">
              The emotions your content sparked in your community
            </p>
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
