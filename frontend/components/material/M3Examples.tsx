'use client';

import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export function M3ButtonExample() {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <MotionButton
        variant="contained"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Filled Button
      </MotionButton>
      <MotionButton
        variant="outlined"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Outlined Button
      </MotionButton>
      <MotionButton
        variant="text"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Text Button
      </MotionButton>
    </Box>
  );
}

export function M3CardExample() {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Animated Card
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This card uses Material Design 3 styling with Framer Motion animations
        </Typography>
      </CardContent>
    </MotionCard>
  );
}