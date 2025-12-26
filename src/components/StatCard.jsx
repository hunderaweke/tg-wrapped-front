import { useEffect, useRef, useState } from 'react';
import './StatCard.css';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  delay = 0,
  formatNumber = true 
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
    ? displayValue.toLocaleString()
    : displayValue;

  return (
    <div
      ref={cardRef}
      className={`stat-card glass-card ${isVisible ? 'visible' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <h3 className="stat-value text-gradient">{formattedValue}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
