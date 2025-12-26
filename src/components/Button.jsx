import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} ${loading ? 'loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          <span style={{ marginLeft: '0.5rem' }}>{children}</span>
        </>
      ) : (
        <>
          <span className="btn-content">{children}</span>
          <span className="btn-glow"></span>
        </>
      )}
    </button>
  );
};

export default Button;
