import { useRef, useEffect } from 'react';
import ProfileAvatar from '../components/ProfileAvatar';
import StatCard from '../components/StatCard';
import HeatMap from '../components/HeatMap';
import MonthlyChart from '../components/MonthlyChart';
import './ResultsPage.css';

const ResultsPage = ({ data }) => {
  const { channel_name, totals, trends, highlights } = data;

  // Top reactions
  const topReactions = Object.entries(highlights.reactions_by_type)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="results-page">
      <div className="gradient-bg"></div>
      
      <div className="results-container">
        {/* Header */}
        <div className="results-header animate-fade-in">
          <ProfileAvatar 
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
          <h2 className="section-title">Overall Performance</h2>
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
          <h2 className="section-title">Daily Posting Activity</h2>
          <p className="section-subtitle">
            Your posting patterns throughout the year
          </p>
          <HeatMap data={trends.posts_by_day} type="daily" />
        </section>

        {/* Monthly Views Chart */}
        <section className="visualization-section glass-card">
          <MonthlyChart 
            data={trends.views_by_month}
            title="Views by Month"
            type="views"
          />
        </section>

        {/* Monthly Posts Chart */}
        <section className="visualization-section glass-card">
          <MonthlyChart 
            data={trends.posts_by_month}
            title="Posts by Month"
            type="posts"
          />
        </section>

        {/* Hourly Posting Pattern */}
        <section className="visualization-section glass-card">
          <h2 className="section-title">Posting Schedule</h2>
          <p className="section-subtitle">
            When you're most active (hours of the day)
          </p>
          <HeatMap data={trends.posts_by_hour} type="hourly" />
        </section>

        {/* Highlights */}
        <section className="highlights-section">
          <h2 className="section-title">Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-card glass-card">
              <div className="highlight-icon">🏆</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Most Viewed Post</h3>
                <p className="highlight-value">
                  {highlights.most_viewed_count.toLocaleString()} views
                </p>
                <p className="highlight-meta">Post ID: {highlights.most_viewed_id}</p>
              </div>
            </div>

            <div className="highlight-card glass-card">
              <div className="highlight-icon">💬</div>
              <div className="highlight-content">
                <h3 className="highlight-title">Most Discussed</h3>
                <p className="highlight-value">
                  {highlights.most_commented_count} comments
                </p>
                <p className="highlight-meta">Post ID: {highlights.most_commented_id}</p>
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
                  {totals.total_forwards}
                </p>
                <p className="highlight-meta">Times your content was shared</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Reactions */}
        <section className="reactions-section glass-card">
          <h2 className="section-title">Top Reactions</h2>
          <p className="section-subtitle">
            How your audience reacted to your content
          </p>
          <div className="reactions-grid">
            {topReactions.map(([emoji, count], index) => (
              <div 
                key={emoji} 
                className="reaction-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count.toLocaleString()}</span>
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
