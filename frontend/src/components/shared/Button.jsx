import React from 'react';

/**
 * LocalCommerce Shared Button Component
 * Supports variants: 'primary' (blue), 'secondary' (navy), 'outline', 'destructive', 'ghost'
 * Supports sizes: 'sm' (28px/32px), 'md' (36px), 'lg' (44px)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'secondary':
        return {
          backgroundColor: '#172554',
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          color: '#172033',
          border: '1px solid #CBD5E1',
        };
      case 'destructive':
        return {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#64748B',
          border: '1px solid transparent',
        };
      default:
        return {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: '28px',
          padding: '0 10px',
          fontSize: '12px',
          borderRadius: '4px',
        };
      case 'lg':
        return {
          height: '44px',
          padding: '0 20px',
          fontSize: '15px',
          borderRadius: '6px',
        };
      case 'md':
      default:
        return {
          height: '36px',
          padding: '0 14px',
          fontSize: '13px',
          borderRadius: '4px',
        };
    }
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.15s ease-in-out',
    userSelect: 'none',
    boxShadow: variant === 'ghost' ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={baseStyle}
      className={className}
      {...props}
    >
      {icon && <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '16px' : '18px' }}>{icon}</span>}
      {children}
      {iconRight && <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '16px' : '18px' }}>{iconRight}</span>}
    </button>
  );
}
