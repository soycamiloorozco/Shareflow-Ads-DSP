import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div 
      className={`
        bg-white 
        rounded-xl 
        shadow-sm 
        border 
        border-neutral-200
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ 
  children, 
  className = '' 
}: CardProps) {
  return (
    <div className={`p-4 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ 
  children, 
  className = '' 
}: CardProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ 
  children, 
  className = '' 
}: CardProps) {
  return (
    <div className={`p-4 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};