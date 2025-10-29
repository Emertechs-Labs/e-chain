import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent as MuiCardContent, CardActions as MuiCardActions } from '@mui/material';

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'elevated';
}

/**
 * Material Design 3 Card component
 * Follows M3 design principles with proper elevation and styling
 */
export const Card: React.FC<CardProps> = ({
  variant = 'filled',
  children,
  ...props
}) => {
  return (
    <MuiCard
      {...props}
      sx={{
        borderRadius: 3, // M3 large border radius
        ...(variant === 'filled' && {
          backgroundColor: 'surface.main',
          boxShadow: 'none',
        }),
        ...(variant === 'outlined' && {
          backgroundColor: 'surface.main',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'outline.variant',
        }),
        ...(variant === 'elevated' && {
          backgroundColor: 'surface.main',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }),
        ...props.sx,
      }}
    >
      {children}
    </MuiCard>
  );
};

/**
 * Material Design 3 CardContent component
 */
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <MuiCardContent {...props} />;
};

/**
 * Material Design 3 CardActions component
 */
export const CardActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <MuiCardActions {...props} />;
};

/**
 * Material Design 3 CardHeader component
 */
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div {...props} style={{ padding: '16px 16px 0 16px' }} />;
};

/**
 * Material Design 3 CardTitle component
 */
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  return <h2 {...props} style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }} />;
};

/**
 * Material Design 3 CardDescription component
 */
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  return <p {...props} style={{ margin: '8px 0 0 0', color: 'text.secondary', fontSize: '0.875rem' }} />;
};

/**
 * Material Design 3 CardFooter component
 */
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div {...props} style={{ padding: '0 16px 16px 16px' }} />;
};