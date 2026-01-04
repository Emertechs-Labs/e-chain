import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
}

/**
 * Material Design 3 Button component
 * Follows M3 design principles with proper styling and accessibility
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  children,
  ...props
}) => {
  // Map M3 variants to MUI variants
  const muiVariant = variant === 'filled' ? 'contained' :
                     variant === 'outlined' ? 'outlined' :
                     variant === 'text' ? 'text' :
                     variant === 'elevated' ? 'contained' :
                     variant === 'tonal' ? 'contained' : 'contained';

  return (
    <MuiButton
      variant={muiVariant}
      {...props}
      sx={{
        textTransform: 'none', // M3 prefers sentence case
        borderRadius: 2, // M3 medium border radius
        fontWeight: 500,
        ...(variant === 'elevated' && {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }),
        ...(variant === 'tonal' && {
          backgroundColor: 'rgba(103, 80, 164, 0.08)',
          color: '#6750a4',
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.12)',
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  );
};