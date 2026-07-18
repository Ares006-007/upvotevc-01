import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'feature' | 'pricing' | 'stack' | 'waveform';
}

export function Card({ children, variant = 'feature', className = '', ...props }: CardProps) {
  const baseClass = `${variant}-card`;
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between ${className}`} style={{ marginBottom: 'var(--spacing-md)' }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`title-md ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
