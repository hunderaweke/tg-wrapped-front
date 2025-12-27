import { useRef, useEffect } from "react";
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

        {/* Posting Activity Heat Map */}
        <section className="visualization-section glass-card">
          <div className="section-header">
            <h2 className="section-title">📅 Daily Posting Activity</h2>
            <p className="section-description">
              Track your content creation journey throughout 2025
            </p>
          </div>
          <HeatMap data={trends.posts_by_day} type="daily" />
        </section>

        {/* Monthly Views Chart */}
        <section className="visualization-section glass-card">
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
        <section className="visualization-section glass-card">
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

        {/* Highlights */}
        <section className="highlights-section">
          <div className="section-header">
            <h2 className="section-title">✨ Channel Highlights</h2>
            <p className="section-description">
              Your standout achievements and milestones
            </p>
          </div>
          <div className="highlights-grid">
            <div className="highlight-card glass-card">
              <div className="highlight-icon">🏆</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Most Viewed Post</h3>
                <p className="highlight-value">
                  <NumberWithTooltip
                    value={highlights.most_viewed_count}
                    suffix=" views"
                  />
                </p>
                <p className="highlight-meta">
                  Post ID: {highlights.most_viewed_id}
                </p>
              </div>
            </div>

            <div className="highlight-card glass-card">
              <div className="highlight-icon">💬</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Most Discussed</h3>
                <p className="highlight-value">
                  <NumberWithTooltip
                    value={highlights.most_commented_count}
                    suffix=" comments"
                  />
                </p>
                <p className="highlight-meta">
                  Post ID: {highlights.most_commented_id}
                </p>
              </div>
            </div>

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
