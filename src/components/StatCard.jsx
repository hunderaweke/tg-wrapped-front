import { useEffect, useRef, useState } from "react";
import "./StatCard.css";

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

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
  formatNumber = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !formatNumber) {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(stepValue * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isVisible, formatNumber]);

  const formattedValue = formatNumber
    ? formatLargeNumber(displayValue)
    : displayValue;

  const showTooltip = formatNumber && isAbbreviated(value);
  const exactValue = value.toLocaleString();

  return (
    <div
      ref={cardRef}
      className={`stat-card glass-card ${isVisible ? "visible" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <h3
          className="stat-value text-gradient"
          title={showTooltip ? `Exact: ${exactValue}` : undefined}
          data-tooltip={showTooltip ? exactValue : undefined}
        >
          {formattedValue}
          {showTooltip && (
            <span className="stat-exact-tooltip">
              <span className="tooltip-label">Exact Value</span>
              <span className="tooltip-number">{exactValue}</span>
            </span>
          )}
        </h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
