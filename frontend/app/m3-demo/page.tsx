import React from 'react';
import { Button, Card, CardContent, CardActions, ThemeToggle } from '@/components/ui';
import { Typography, Box, Container, Grid } from '@mui/material';

/**
 * Material Design 3 Demo Page
 * Showcases the implemented M3 components and theme
 */
export default function MaterialDesign3Demo() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="headlineLarge" component="h1">
          Material Design 3 Demo
        </Typography>
        <ThemeToggle />
      </Box>

      <Typography variant="bodyLarge" sx={{ mb: 4 }}>
        This page demonstrates the Material Design 3 implementation with dynamic theming,
        modern components, and consistent design tokens.
      </Typography>

      <Grid container spacing={3}>
        {/* Button Variants */}
        <Grid item xs={12} md={6}>
          <Card variant="elevated">
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Button Variants
              </Typography>
              <Typography variant="bodyMedium" sx={{ mb: 2 }}>
                Material Design 3 button styles with proper elevation and interaction states.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="filled">Filled</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
                <Button variant="elevated">Elevated</Button>
                <Button variant="tonal">Tonal</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Variants */}
        <Grid item xs={12} md={6}>
          <Card variant="elevated">
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Card Variants
              </Typography>
              <Typography variant="bodyMedium" sx={{ mb: 2 }}>
                Different card styles showcasing M3 elevation and surface treatments.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="filled" sx={{ p: 2 }}>
                  <Typography variant="bodyMedium">Filled Card</Typography>
                </Card>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="bodyMedium">Outlined Card</Typography>
                </Card>
                <Card variant="elevated" sx={{ p: 2 }}>
                  <Typography variant="bodyMedium">Elevated Card</Typography>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Typography Scale */}
        <Grid item xs={12}>
          <Card variant="elevated">
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Typography Scale
              </Typography>
              <Typography variant="bodyMedium" sx={{ mb: 3 }}>
                Material Design 3 typography scale with proper line heights and letter spacing.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="displayLarge">Display Large</Typography>
                <Typography variant="displayMedium">Display Medium</Typography>
                <Typography variant="displaySmall">Display Small</Typography>
                <Typography variant="headlineLarge">Headline Large</Typography>
                <Typography variant="headlineMedium">Headline Medium</Typography>
                <Typography variant="headlineSmall">Headline Small</Typography>
                <Typography variant="titleLarge">Title Large</Typography>
                <Typography variant="titleMedium">Title Medium</Typography>
                <Typography variant="titleSmall">Title Small</Typography>
                <Typography variant="labelLarge">Label Large</Typography>
                <Typography variant="labelMedium">Label Medium</Typography>
                <Typography variant="labelSmall">Label Small</Typography>
                <Typography variant="bodyLarge">Body Large - Material Design 3 provides a comprehensive type scale that ensures readability and hierarchy across all screen sizes and devices.</Typography>
                <Typography variant="bodyMedium">Body Medium - The type scale includes styles for display, headline, title, body, and label text, each with carefully calculated size, weight, and spacing.</Typography>
                <Typography variant="bodySmall">Body Small - This systematic approach creates visual harmony and improves user experience.</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}