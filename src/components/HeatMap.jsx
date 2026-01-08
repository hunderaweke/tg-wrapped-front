import { useState, useMemo, useEffect } from "react";
import "./HeatMap.css";

const HeatMap = ({ data, type = "daily" }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    // Trigger staggered animation after mount
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Memoized grid generation for daily heatmap
  const { grid, weeks, monthLabels, stats } = useMemo(() => {
    if (type !== "daily") {
      return { grid: [], weeks: 0, monthLabels: [], stats: null };
    }

    const year = 2025;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const gridStartDate = new Date(startDate);
    gridStartDate.setDate(gridStartDate.getDate() - gridStartDate.getDay());

    const gridEndDate = new Date(endDate);
    gridEndDate.setDate(gridEndDate.getDate() + (6 - gridEndDate.getDay()));

    const daysDiff = Math.ceil(
      (gridEndDate - gridStartDate) / (1000 * 60 * 60 * 24)
    );
    const totalWeeks = Math.ceil(daysDiff / 7);

    const generatedGrid = Array(7)
      .fill(null)
      .map(() => Array(totalWeeks).fill(null));

    const monthNames = [
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

    let currentDate = new Date(gridStartDate);
    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const month = currentDate.getMonth();
        const dayOfMonth = currentDate.getDate();
        const currentYear = currentDate.getFullYear();

        if (currentYear === year) {
          const monthKey = `${year}-${monthNames[month]}`;
          let count = 0;
          if (data[monthKey] && data[monthKey][dayOfMonth - 1] !== undefined) {
            count = data[monthKey][dayOfMonth - 1];
          }

          generatedGrid[day][week] = {
            date: new Date(currentDate),
            count,
            month: monthNames[month],
            day: dayOfMonth,
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Calculate month labels
    const labels = [];
    const shortMonthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let lastMonth = -1;

    for (let week = 0; week < totalWeeks; week++) {
      const cellData =
        generatedGrid[0][week] ||
        generatedGrid[1][week] ||
        generatedGrid[2][week] ||
        generatedGrid[3][week] ||
        generatedGrid[4][week] ||
        generatedGrid[5][week] ||
        generatedGrid[6][week];

      if (cellData) {
        const currentMonth = cellData.date.getMonth();
        if (currentMonth !== lastMonth) {
          labels.push({ week, month: shortMonthNames[currentMonth] });
          lastMonth = currentMonth;
        }
      }
    }

    // Calculate statistics
    let total = 0;
    let activeDays = 0;
    let maxPosts = 0;
    let bestDay = null;
    let currentStreak = 0;
    let maxStreak = 0;

    generatedGrid.flat().forEach((cell) => {
      if (cell && cell.count > 0) {
        total += cell.count;
        activeDays++;
        if (cell.count > maxPosts) {
          maxPosts = cell.count;
          bestDay = cell;
        }
      }
    });

    const sortedCells = generatedGrid
      .flat()
      .filter((cell) => cell !== null)
      .sort((a, b) => a.date - b.date);

    sortedCells.forEach((cell) => {
      if (cell.count > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    const avgPosts = activeDays > 0 ? (total / activeDays).toFixed(1) : 0;

    return {
      grid: generatedGrid,
      weeks: totalWeeks,
      monthLabels: labels,
      stats: { total, activeDays, maxPosts, avgPosts, bestDay, maxStreak },
    };
  }, [data, type]);

  // Memoized hourly stats
  const hourlyStats = useMemo(() => {
    if (type !== "hourly") {
      return { total: 0, maxPosts: 0, avgPosts: "0", peakHours: [] };
    }

    const values = Object.values(data);
    const total = values.reduce((a, b) => a + b, 0);
    const maxPosts = Math.max(...values, 0);
    const avgPosts = (total / 24).toFixed(1);

    const sortedHours = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return { total, maxPosts, avgPosts, peakHours: sortedHours };
  }, [data, type]);

  const getColorIntensity = (count) => {
    if (count === 0) return "var(--heatmap-level-0)";
    if (count <= 2) return "var(--heatmap-level-1)";
    if (count <= 5) return "var(--heatmap-level-2)";
    if (count <= 10) return "var(--heatmap-level-3)";
    return "var(--heatmap-level-4)";
  };

  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (type === "daily") {
    return (
      <div
        className={`heatmap-container github-style ${
          animationReady ? "animated" : ""
        }`}
      >
        {/* Stats Summary Bar */}
        <div className="heatmap-stats-bar">
          <div className="heatmap-stat-item">
            <span className="stat-value">{stats.total.toLocaleString()}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="heatmap-stat-item">
            <span className="stat-value">{stats.activeDays}</span>
            <span className="stat-label">Active Days</span>
          </div>
          <div className="heatmap-stat-item">
            <span className="stat-value">{stats.avgPosts}</span>
            <span className="stat-label">Avg/Day</span>
          </div>
          <div className="heatmap-stat-item highlight">
            <span className="stat-value">{stats.maxStreak}</span>
            <span className="stat-label">🔥 Best Streak</span>
          </div>
        </div>

        <div className="heatmap-wrapper">
          {/* Month labels */}
          <div className="month-labels">
            {monthLabels.map(({ week, month }) => (
              <div
                key={`${month}-${week}`}
                className="month-label"
                style={{ left: `${week * 17}px` }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="heatmap-grid">
            {/* Day labels */}
            <div className="day-labels">
              {dayLabels.map((day, idx) => (
                <div key={day} className="day-label">
                  {idx % 2 === 1 ? day.slice(0, 3) : ""}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="heatmap-cells">
              {grid.map((week, dayIdx) => (
                <div key={dayIdx} className="heatmap-row">
                  {week.map((cellData, weekIdx) => (
                    <div
                      key={`${dayIdx}-${weekIdx}`}
                      className={`heatmap-cell ${
                        cellData ? "" : "empty"
                      } level-${
                        cellData ? getIntensityLevel(cellData.count) : 0
                      }`}
                      style={{
                        backgroundColor: cellData
                          ? getColorIntensity(cellData.count)
                          : "var(--heatmap-level-0)",
                        animationDelay: animationReady
                          ? `${(dayIdx * weeks + weekIdx) * 2}ms`
                          : "0ms",
                      }}
                      onMouseEnter={() =>
                        cellData &&
                        setHoveredCell({
                          ...cellData,
                          key: `${dayIdx}-${weekIdx}`,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {hoveredCell?.key === `${dayIdx}-${weekIdx}` &&
                        cellData && (
                          <div className="heatmap-tooltip github-tooltip">
                            <div className="tooltip-header">
                              <span className="tooltip-count">
                                {cellData.count}
                              </span>
                              <span className="tooltip-label">
                                {cellData.count === 1 ? "post" : "posts"}
                              </span>
                            </div>
                            <span className="tooltip-date">
                              {cellData.month} {cellData.day}, 2025
                            </span>
                            <div
                              className="tooltip-indicator"
                              style={{
                                backgroundColor: getColorIntensity(
                                  cellData.count
                                ),
                              }}
                            ></div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="heatmap-legend github-legend">
            <span className="legend-text">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`legend-cell level-${level}`}
                style={{ backgroundColor: `var(--heatmap-level-${level})` }}
                title={
                  level === 0
                    ? "No posts"
                    : level === 1
                    ? "1-2 posts"
                    : level === 2
                    ? "3-5 posts"
                    : level === 3
                    ? "6-10 posts"
                    : "10+ posts"
                }
              />
            ))}
            <span className="legend-text">More</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "hourly") {
    const getHourlyColorIntensity = (count) => {
      const max = Math.max(...Object.values(data));
      const intensity = count / max;
      return `rgba(0, 212, 255, ${Math.max(0.1, intensity)})`;
    };

    const getIntensityClass = (count) => {
      const max = Math.max(...Object.values(data));
      const intensity = count / max;
      if (intensity === 0) return "intensity-0";
      if (intensity <= 0.25) return "intensity-1";
      if (intensity <= 0.5) return "intensity-2";
      if (intensity <= 0.75) return "intensity-3";
      return "intensity-4";
    };

    const formatHour = (hour) => {
      const hourNum = parseInt(hour);
      if (hourNum === 0) return "12 AM";
      if (hourNum === 12) return "12 PM";
      if (hourNum < 12) return `${hourNum} AM`;
      return `${hourNum - 12} PM`;
    };

    const isPeakHour = (hour) => hourlyStats.peakHours.includes(parseInt(hour));

    return (
      <div
        className={`heatmap-container hourly-container ${
          animationReady ? "animated" : ""
        }`}
      >
        {/* Hourly Stats Summary */}
        <div className="heatmap-stats-bar hourly-stats">
          <div className="heatmap-stat-item">
            <span className="stat-value">
              {hourlyStats.total.toLocaleString()}
            </span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="heatmap-stat-item">
            <span className="stat-value">{hourlyStats.avgPosts}</span>
            <span className="stat-label">Avg/Hour</span>
          </div>
          <div className="heatmap-stat-item highlight">
            <span className="stat-value">
              {formatHour(hourlyStats.peakHours[0])}
            </span>
            <span className="stat-label">⚡ Peak Hour</span>
          </div>
        </div>

        <div className="heatmap-grid-hourly">
          {Object.entries(data)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([hour, count], index) => (
              <div
                key={hour}
                className={`heatmap-hour-cell ${getIntensityClass(count)} ${
                  isPeakHour(hour) ? "peak-hour" : ""
                }`}
                style={{
                  background: getHourlyColorIntensity(count),
                  animationDelay: animationReady ? `${index * 30}ms` : "0ms",
                }}
                onMouseEnter={() => setHoveredCell({ hour, count })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {isPeakHour(hour) && <div className="peak-badge">🔥</div>}
                <div className="hour-label">{formatHour(hour)}</div>
                <div className="hour-count">{count}</div>
                <div
                  className="hour-bar"
                  style={{
                    height: `${(count / hourlyStats.maxPosts) * 100}%`,
                  }}
                ></div>
                {hoveredCell?.hour === hour && (
                  <div className="heatmap-tooltip hourly-tooltip">
                    <div className="tooltip-header">
                      <span className="tooltip-count">{count}</span>
                      <span className="tooltip-label">
                        {count === 1 ? "post" : "posts"}
                      </span>
                    </div>
                    <span className="tooltip-date">at {formatHour(hour)}</span>
                    <div className="tooltip-percentage">
                      {((count / hourlyStats.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Time Period Labels */}
        <div className="time-period-labels">
          <span className="period-label">🌙 Night</span>
          <span className="period-label">🌅 Morning</span>
          <span className="period-label">☀️ Afternoon</span>
          <span className="period-label">🌆 Evening</span>
        </div>
      </div>
    );
  }

  return null;
};

export default HeatMap;
