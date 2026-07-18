import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'outline';
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  let style: React.CSSProperties = {};
  
  if (variant === 'success') {
    style = { backgroundColor: 'var(--color-semantic-success)', color: 'var(--color-on-primary)' };
  } else if (variant === 'error') {
    style = { backgroundColor: 'var(--color-semantic-error)', color: 'var(--color-on-primary)' };
  } else if (variant === 'outline') {
    style = { backgroundColor: 'transparent', border: '1px solid var(--color-hairline-strong)' };
  }

  return (
    <span className={`badge-pill ${className}`} style={style} {...props}>
      {children}
    </span>
  );
}
