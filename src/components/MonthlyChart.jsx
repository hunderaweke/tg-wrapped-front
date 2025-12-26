import { useEffect, useRef } from 'react';
import './MonthlyChart.css';

const MonthlyChart = ({ data, title, type = 'views' }) => {
  const chartRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          barsRef.current.forEach((bar, index) => {
            if (bar) {
              setTimeout(() => {
                bar.style.transform = 'scaleY(1)';
                bar.style.opacity = '1';
              }, index * 50);
            }
          });
        }
      },
      { threshold: 0.2 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const maxValue = Math.max(...Object.values(data));
  const entries = Object.entries(data).sort((a, b) => {
    const monthA = new Date(a[0]).getMonth();
    const monthB = new Date(b[0]).getMonth();
    return monthA - monthB;
  });

  return (
    <div ref={chartRef} className="monthly-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-container">
        {entries.map(([month, value], index) => {
          const monthName = month.split('-')[1];
          const heightPercent = (value / maxValue) * 100;

          return (
            <div key={month} className="chart-bar-wrapper">
              <div className="chart-bar-container">
                <div
                  ref={el => barsRef.current[index] = el}
                  className="chart-bar"
                  style={{
                    height: `${heightPercent}%`,
                    background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                  }}
                >
                  <div className="bar-tooltip">
                    {value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="chart-label">{monthName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyChart;
