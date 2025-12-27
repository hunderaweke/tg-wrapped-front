import { useState } from "react";
import "./HeatMap.css";

const HeatMap = ({ data, type = "daily" }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (type === "daily") {
    // Create a full year grid (Jan 1 - Dec 31, 2025)
    const year = 2025;
    const startDate = new Date(year, 0, 1); // January 1, 2025
    const endDate = new Date(year, 11, 31); // December 31, 2025

    // Go to the Sunday before January 1
    const gridStartDate = new Date(startDate);
    gridStartDate.setDate(gridStartDate.getDate() - gridStartDate.getDay());

    // Go to the Saturday after December 31
    const gridEndDate = new Date(endDate);
    gridEndDate.setDate(gridEndDate.getDate() + (6 - gridEndDate.getDay()));

    // Calculate number of weeks
    const daysDiff = Math.ceil(
      (gridEndDate - gridStartDate) / (1000 * 60 * 60 * 24)
    );
    const weeks = Math.ceil(daysDiff / 7);

    // Build grid: 7 rows (days) × weeks columns
    const grid = Array(7)
      .fill(null)
      .map(() => Array(weeks).fill(null));

    // Fill grid with all days in the year
    let currentDate = new Date(gridStartDate);
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const month = currentDate.getMonth(); // 0-11
        const dayOfMonth = currentDate.getDate();
        const currentYear = currentDate.getFullYear();

        // Only include dates within 2025
        if (currentYear === year) {
          // Get month name
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
          const monthKey = `${year}-${monthNames[month]}`;

          // Get post count for this day (if it exists in data)
          let count = 0;
          if (data[monthKey] && data[monthKey][dayOfMonth - 1] !== undefined) {
            count = data[monthKey][dayOfMonth - 1];
          }

          grid[day][week] = {
            date: new Date(currentDate),
            count,
            month: monthNames[month],
            day: dayOfMonth,
          };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Determine month labels positions
    const monthLabels = [];
    const monthNames = [
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

    for (let week = 0; week < weeks; week++) {
      // Check multiple rows to find a valid cell in this week
      const cellData =
        grid[0][week] ||
        grid[1][week] ||
        grid[2][week] ||
        grid[3][week] ||
        grid[4][week] ||
        grid[5][week] ||
        grid[6][week];

      if (cellData) {
        const currentMonth = cellData.date.getMonth();
        if (currentMonth !== lastMonth) {
          monthLabels.push({ week, month: monthNames[currentMonth] });
          lastMonth = currentMonth;
        }
      }
    }

    const getColorIntensity = (count) => {
      if (count === 0) return "var(--heatmap-level-0)";
      if (count <= 2) return "var(--heatmap-level-1)";
      if (count <= 5) return "var(--heatmap-level-2)";
      if (count <= 10) return "var(--heatmap-level-3)";
      return "var(--heatmap-level-4)";
    };

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="heatmap-container github-style">
        <div className="heatmap-wrapper">
          {/* Month labels */}
          <div className="month-labels">
            <div className="day-label-spacer"></div>
            {monthLabels.map(({ week, month }) => (
              <div
                key={`${month}-${week}`}
                className="month-label"
                style={{ gridColumn: week + 2 }}
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
                  {idx % 2 === 1 ? day.slice(0, 3) : ""}{" "}
                  {/* Show only Mon, Wed, Fri */}
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
                      className={`heatmap-cell ${cellData ? "" : "empty"}`}
                      style={{
                        backgroundColor: cellData
                          ? getColorIntensity(cellData.count)
                          : "var(--heatmap-level-0)",
                      }}
                      onMouseEnter={() =>
                        cellData &&
                        setHoveredCell({
                          ...cellData,
                          key: `${dayIdx}-${weekIdx}`,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      title={
                        cellData
                          ? `${cellData.count} posts on ${cellData.month} ${cellData.day}, 2025`
                          : ""
                      }
                    >
                      {hoveredCell?.key === `${dayIdx}-${weekIdx}` &&
                        cellData && (
                          <div className="heatmap-tooltip github-tooltip">
                            <strong>
                              {cellData.count}{" "}
                              {cellData.count === 1 ? "post" : "posts"}
                            </strong>
                            <span>
                              {cellData.month} {cellData.day}, 2025
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend github-legend">
            <span className="legend-text">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="legend-cell"
                style={{ backgroundColor: `var(--heatmap-level-${level})` }}
              />
            ))}
            <span className="legend-text">More</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "hourly") {
    const getColorIntensity = (count) => {
      const max = Math.max(...Object.values(data));
      const intensity = count / max;
      return `rgba(0, 212, 255, ${Math.max(0.1, intensity)})`;
    };

    const formatHour = (hour) => {
      const hourNum = parseInt(hour);
      if (hourNum === 0) return "12 AM";
      if (hourNum === 12) return "12 PM";
      if (hourNum < 12) return `${hourNum} AM`;
      return `${hourNum - 12} PM`;
    };

    return (
      <div className="heatmap-container">
        <div className="heatmap-grid-hourly">
          {Object.entries(data)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([hour, count]) => (
              <div
                key={hour}
                className="heatmap-hour-cell"
                style={{ background: getColorIntensity(count) }}
                onMouseEnter={() => setHoveredCell({ hour, count })}
                onMouseLeave={() => setHoveredCell(null)}
                title={`${count} posts at ${formatHour(hour)}`}
              >
                <div className="hour-label">{formatHour(hour)}</div>
                <div className="hour-count">{count}</div>
                {hoveredCell?.hour === hour && (
                  <div className="heatmap-tooltip hourly-tooltip">
                    <strong>
                      {count} {count === 1 ? "post" : "posts"}
                    </strong>
                    <span>at {formatHour(hour)}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
};

export default HeatMap;
