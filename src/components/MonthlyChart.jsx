import { useEffect, useRef, useState, useMemo } from "react";
import "./MonthlyChart.css";

const MonthlyChart = ({ data, title, type = "views" }) => {
  const chartRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const entries = useMemo(() => {
    return Object.entries(data).sort((a, b) => {
      const monthOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthA = a[0].split("-")[1];
      const monthB = b[0].split("-")[1];
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    });
  }, [data]);

  const stats = useMemo(() => {
    const values = Object.values(data);
    const total = values.reduce((a, b) => a + b, 0);
    const maxValue = Math.max(...values);
    const avgValue = (total / values.length).toFixed(0);
    const maxMonth =
      entries.find(([_, v]) => v === maxValue)?.[0]?.split("-")[1] || "";
    return { total, maxValue, avgValue, maxMonth };
  }, [data, entries]);

  const getBarColor = (value, index, isHovered) => {
    const intensity = value / stats.maxValue;
    if (isHovered) {
      return `linear-gradient(180deg, 
        rgba(0, 255, 204, 1) 0%,
        rgba(0, 212, 255, 0.95) 40%,
        rgba(124, 58, 237, 0.9) 100%)`;
    }
    return `linear-gradient(180deg, 
      rgba(0, 212, 255, ${0.7 + intensity * 0.3}) 0%,
      rgba(0, 180, 220, ${0.6 + intensity * 0.3}) 50%,
      rgba(124, 58, 237, ${0.4 + intensity * 0.4}) 100%)`;
  };

  return (
    <div
      ref={chartRef}
      className={`monthly-chart ${isVisible ? "visible" : ""}`}
    >
      {/* Stats Header */}
      <div className="chart-stats-header">
        <div className="chart-stat">
          <span className="chart-stat-value">
            {stats.total.toLocaleString()}
          </span>
          <span className="chart-stat-label">
            Total {type === "views" ? "Views" : "Posts"}
          </span>
        </div>
        <div className="chart-stat">
          <span className="chart-stat-value">{stats.avgValue}</span>
          <span className="chart-stat-label">Monthly Avg</span>
        </div>
        <div className="chart-stat highlight">
          <span className="chart-stat-value">{stats.maxMonth.slice(0, 3)}</span>
          <span className="chart-stat-label">🏆 Peak Month</span>
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-y-axis">
          {[100, 75, 50, 25, 0].map((percent) => (
            <div key={percent} className="y-axis-label">
              <span>
                {Math.round((stats.maxValue * percent) / 100).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="chart-area">
          <div className="chart-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line"></div>
            ))}
          </div>

          <div className="bars-container">
            {entries.map(([month, value], index) => {
              const monthName = month.split("-")[1];
              const shortMonth = monthName.substring(0, 3);
              const heightPercent = (value / stats.maxValue) * 100;
              const isHovered = hoveredBar === index;
              const isPeak = value === stats.maxValue;

              return (
                <div
                  key={month}
                  className={`bar-column ${isHovered ? "hovered" : ""} ${
                    isPeak ? "peak" : ""
                  }`}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ "--delay": `${index * 60}ms` }}
                >
                  {/* Bar Group */}
                  <div className="bar-group">
                    {/* Background Track */}
                    <div className="bar-track"></div>

                    {/* Main Bar */}
                    <div
                      className="bar"
                      style={{
                        "--height": `${heightPercent}%`,
                        background: getBarColor(value, index, isHovered),
                      }}
                    >
                      {/* Inner Glow */}
                      <div className="bar-inner-glow"></div>

                      {/* Reflection */}
                      <div className="bar-reflection"></div>

                      {/* Top Cap */}
                      <div className="bar-cap">
                        <div className="cap-shine"></div>
                      </div>
                    </div>

                    {/* Value Popup */}
                    <div className={`value-popup ${isHovered ? "show" : ""}`}>
                      <div className="popup-content">
                        <span className="popup-value">
                          {value.toLocaleString()}
                        </span>
                        <span className="popup-type">
                          {type === "views" ? "views" : "posts"}
                        </span>
                      </div>
                      <div className="popup-arrow"></div>
                    </div>
                  </div>

                  <div className="month-label">
                    <span>{shortMonth}</span>
                    {isPeak && <span className="peak-indicator">★</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chart-bottom-accent">
        <div className="accent-line"></div>
        <div className="accent-dots">
          {entries.map((_, i) => (
            <div
              key={i}
              className={`accent-dot ${hoveredBar === i ? "active" : ""}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;
