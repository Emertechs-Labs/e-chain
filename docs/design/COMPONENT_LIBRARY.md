# 🧩 Component Library - Mobile-First Enhanced

<div align="center">

![Component Library](https://img.shields.io/badge/Echain-Component_Library-00D4FF?style=for-the-badge&logo=react&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Mobile First](https://img.shields.io/badge/Mobile_First-34C759?style=for-the-badge&logo=apple&logoColor=white)

**Touch-optimized component library for the Echain platform**

*Built with shadcn/ui, Radix UI, and Tailwind CSS - Mobile excellence maintained*

</div>

---

## Overview - Mobile-First Evolution

The Echain component library provides essential, reusable UI components focused on blockchain event experiences. All components follow accessibility standards and are optimized for **mobile-first touch interactions** with seamless desktop scaling.

### Mobile-First Principles
```
📱 Touch-First Design: 44px minimum touch targets with haptic feedback
🎯 Progressive Enhancement: Core functionality works everywhere, enhancements add delight
⚡ Performance Optimized: Battery-conscious animations and efficient rendering
♿ Inclusive by Default: Accessibility built-in from the ground up
🎨 Preserved Harmony: Signature cyan-blue-purple gradient maintained across devices
```

## 🏗️ Architecture - Mobile Enhanced

### Technology Stack - Touch Optimized
```yaml
UI Framework:
  - React 18.2.0: Modern React with concurrent features and touch gestures
  - TypeScript 5.0.0: Type-safe component development with mobile interfaces
  - Tailwind CSS 4.0: Utility-first styling with mobile-first responsive design

Component Library:
  - shadcn/ui: High-quality, accessible components with touch enhancements
  - Radix UI: Headless UI primitives optimized for mobile accessibility
  - Lucide Icons: Consistent icon system with touch-friendly sizing

Animation & Interaction:
  - Framer Motion: Smooth, subtle animations with reduced motion support
  - Touch Gestures: Swipe, pinch, and long-press interactions
  - Haptic Feedback: Device vibration for important interactions
```

### Component Structure - Mobile Organized
```
components/
├── ui/                    # Base design system components (mobile-first)
│   ├── button.tsx        # Touch-optimized button with haptic feedback
│   ├── input.tsx         # Mobile keyboard-optimized input fields
│   ├── card.tsx          # Touch-friendly card containers
│   └── ...
├── sections/             # Page section components (responsive)
│   ├── HeroSection.tsx   # Mobile-optimized hero with touch search
│   ├── FeaturesSection.tsx # Swipeable feature cards
│   ├── FAQSection.tsx    # Accordion-style FAQ for mobile
│   └── ...
├── blockchain/           # Blockchain-specific components (Web3 mobile)
│   ├── wallet-button.tsx # One-tap wallet connection
│   ├── transaction-status.tsx # Mobile-optimized transaction feedback
│   └── ...
└── layout/               # Layout components (adaptive)
    ├── header.tsx        # Responsive header with mobile menu
    └── footer.tsx        # Touch-friendly footer navigation
```

## 🎯 Core Components - Touch Optimized

### Button Component - Mobile Excellence

#### Touch-Optimized Variants
```typescript
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'touch'; // Added touch size
type TouchFeedback = 'none' | 'light' | 'medium' | 'heavy';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  hapticFeedback?: TouchFeedback;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

#### Mobile Usage Examples
```tsx
// Primary action with haptic feedback
<Button
  size="touch"
  hapticFeedback="medium"
  className="min-h-[44px] px-6"
>
  Create Event
</Button>

// Secondary action with loading state
<Button
  variant="secondary"
  loading={isLoading}
  disabled={isLoading}
  className="min-h-[44px] w-full"
>
  {isLoading ? 'Connecting...' : 'Connect Wallet'}
</Button>

// Touch-optimized outline button
<Button
  variant="outline"
  size="touch"
  className="min-h-[44px] border-2 active:scale-95 transition-transform"
>
  View Details
</Button>
```

#### Touch Interaction Patterns
```tsx
// Button with advanced touch handling
const TouchButton = ({ onClick, children, ...props }) => {
  const handleTouch = useCallback((e) => {
    // Prevent double-tap zoom on iOS
    e.preventDefault();

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    onClick?.(e);
  }, [onClick]);

  return (
    <button
      onTouchEnd={handleTouch}
      onClick={onClick}
      className="touch-manipulation select-none"
      {...props}
    >
      {children}
    </button>
  );
};
```

### Card Component - Mobile Responsive

#### Touch-Friendly Card
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'sm' | 'md' | 'lg' | 'touch';
  interactive?: boolean;
  hapticFeedback?: boolean;
  children: React.ReactNode;
}
```

#### Mobile Usage Examples
```tsx
// Interactive feature card with touch feedback
<Card
  variant="interactive"
  padding="touch"
  hapticFeedback={true}
  className="min-h-[120px] p-6 active:scale-98 transition-transform cursor-pointer"
  onClick={handleCardClick}
>
  <div className="flex items-center space-x-4">
    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
      <span className="text-xl">🛡️</span>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">Blockchain Verified</h3>
      <p className="text-muted-foreground text-sm">
        All events are verified on-chain with immutable records.
      </p>
    </div>
  </div>
</Card>

// Swipeable card for mobile lists
<Card className="swipe-container">
  <div className="swipe-content">
    {/* Card content */}
  </div>
  <div className="swipe-actions">
    <Button variant="destructive" size="sm">Delete</Button>
    <Button variant="secondary" size="sm">Edit</Button>
  </div>
</Card>
```

### Input Component - Mobile Keyboard Optimized

#### Mobile-Optimized Input
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  variant?: 'default' | 'underline' | 'filled';
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'none';
  autoComplete?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}
```

#### Mobile Usage Examples
```tsx
// Search input with mobile optimizations
<Input
  type="search"
  inputMode="search"
  enterKeyHint="search"
  autoComplete="off"
  autoCapitalize="none"
  placeholder="Search events, artists, venues..."
  className="w-full h-12 px-4 text-base bg-card/50 backdrop-blur-sm border border-border text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl"
/>

// Email input for forms
<Input
  type="email"
  inputMode="email"
  enterKeyHint="next"
  autoComplete="email"
  autoCapitalize="none"
  placeholder="Enter your email"
  className="w-full h-12 px-4 text-base rounded-lg"
/>

// Phone number input
<Input
  type="tel"
  inputMode="tel"
  enterKeyHint="done"
  autoComplete="tel"
  placeholder="(555) 123-4567"
  className="w-full h-12 px-4 text-base rounded-lg"
/>
```

## 🔗 Section Components - Mobile Responsive

### HeroSection Component - Touch-First Design

#### Mobile-Optimized Landing Hero
```typescript
interface HeroSectionProps {
  onSearch?: (query: string) => void;
  enableHapticFeedback?: boolean;
  reducedMotion?: boolean;
}
```

#### Mobile Features
- **Touch Search Integration**: Large touch targets with keyboard optimization
- **Trust Indicators**: Subtle security badges with haptic confirmation
- **Responsive Scaling**: Fluid typography and spacing across all devices
- **Gesture Support**: Swipe gestures for navigation between sections
- **Accessibility**: Full keyboard navigation and screen reader optimization
- **Performance**: Lazy loading with intersection observer

#### Mobile Usage
```tsx
// Touch-optimized hero section
<HeroSection
  onSearch={handleSearch}
  enableHapticFeedback={true}
  reducedMotion={prefersReducedMotion}
/>
```

### FeaturesSection Component - Swipeable Cards

#### Touch-Interactive Feature Display
```typescript
interface FeaturesSectionProps {
  enableSwipe?: boolean;
  hapticFeedback?: boolean;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}
```

#### Mobile Features
- **Swipeable Cards**: Horizontal scrolling with momentum on mobile
- **Touch Gestures**: Pinch to zoom, long press for details
- **Progressive Loading**: Cards load as they enter viewport
- **Consistent Icons**: Touch-friendly emoji and icon sizing
- **Hover States**: Touch feedback with visual and haptic responses
- **Responsive Grid**: Adapts from swipeable mobile to grid desktop

#### Mobile Usage
```tsx
// Swipeable features for mobile
<FeaturesSection
  enableSwipe={true}
  hapticFeedback={true}
  itemsPerView={{
    mobile: 1,
    tablet: 2,
    desktop: 3
  }}
/>
```

### FAQSection Component - Accordion Optimized

#### Mobile-First FAQ Interface
```typescript
interface FAQSectionProps {
  variant?: 'accordion' | 'tabs' | 'grid';
  enableSearch?: boolean;
  hapticFeedback?: boolean;
  defaultExpanded?: string[];
}
```

#### Mobile Features
- **Touch Accordion**: Large touch targets for expanding/collapsing
- **Search Integration**: Filter FAQs with mobile keyboard
- **Progressive Disclosure**: Load answers on demand
- **Gesture Support**: Swipe between related questions
- **Accessibility**: Proper heading structure and ARIA labels

## ⛓️ Blockchain Components - Web3 Mobile Optimized

### Wallet Connection Button - One-Tap Mobile

#### Touch-Optimized Wallet Integration
```typescript
interface WalletButtonProps {
  isConnected: boolean;
  address?: string;
  ensName?: string;
  balance?: string;
  network?: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSwitchNetwork?: () => void;
  variant?: 'default' | 'compact' | 'full';
  hapticFeedback?: boolean;
  showBalance?: boolean;
}
```

#### Mobile Usage Example
```tsx
// One-tap wallet connection for mobile
<WalletButton
  isConnected={isConnected}
  address={address}
  ensName={ensName}
  balance={balance}
  network={network}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  variant="full"
  hapticFeedback={true}
  showBalance={true}
  className="min-h-[48px] w-full"
/>
```

#### Mobile Wallet Features
- **One-Tap Connection**: Single touch to connect wallet
- **Network Switching**: Easy network changes with confirmation
- **Balance Display**: Formatted crypto balances with fiat conversion
- **Address Copy**: Touch-friendly copy with haptic feedback
- **Connection Status**: Clear visual and haptic connection states
- **Error Handling**: Mobile-optimized error messages and recovery

### Transaction Status Component - Mobile Feedback

#### Touch-Friendly Transaction Feedback
```typescript
type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';
type HapticPattern = 'success' | 'error' | 'pending' | 'confirmation';

interface TransactionStatusProps {
  status: TransactionStatus;
  hash: string;
  confirmations?: number;
  estimatedTime?: number;
  gasUsed?: string;
  gasPrice?: string;
  error?: string;
  onViewExplorer?: () => void;
  onRetry?: () => void;
  hapticFeedback?: boolean;
  showConfetti?: boolean;
}
```

#### Mobile Usage Example
```tsx
// Mobile-optimized transaction status
<TransactionStatus
  status={transactionStatus}
  hash={transactionHash}
  confirmations={blockConfirmations}
  estimatedTime={estimatedCompletion}
  gasUsed={gasUsed}
  gasPrice={gasPrice}
  onViewExplorer={() => openExplorer(transactionHash)}
  onRetry={handleRetry}
  hapticFeedback={true}
  showConfetti={status === 'confirmed'}
/>
```

#### Mobile Transaction Features
- **Progress Animation**: Smooth progress indicators with haptic feedback
- **Confirmation Counter**: Real-time block confirmations
- **Gas Estimation**: Clear gas usage and cost display
- **Error Recovery**: Touch-friendly retry and support options
- **Explorer Links**: One-tap access to blockchain explorers
- **Success Celebration**: Confetti animation for completed transactions

## 📱 Layout Components - Adaptive Design

### Header Component - Mobile Navigation

#### Responsive Navigation Header
```typescript
interface HeaderProps {
  user?: {
    address: string;
    ensName?: string;
    balance?: string;
    avatar?: string;
  };
  onConnectWallet: () => Promise<void>;
  onDisconnectWallet: () => void;
  navigationItems?: NavigationItem[];
  showSearch?: boolean;
  variant?: 'default' | 'transparent' | 'elevated';
}
```

#### Mobile Features
- **Touch Menu**: Hamburger menu with smooth slide-out navigation
- **Wallet Integration**: One-tap connect/disconnect with balance display
- **Search Toggle**: Expandable search bar for mobile screens
- **User Profile**: Touch-friendly user menu with avatar
- **Navigation**: Bottom tab navigation for mobile, top bar for desktop
- **Safe Areas**: iOS safe area support for notched devices

#### Mobile Usage
```tsx
// Adaptive header for all devices
<Header
  user={user}
  onConnectWallet={handleWalletConnect}
  onDisconnectWallet={handleWalletDisconnect}
  navigationItems={navItems}
  showSearch={true}
  variant="elevated"
  className="sticky top-0 z-50"
/>
```

### Footer Component - Touch Navigation

#### Mobile-Optimized Site Footer
```typescript
interface FooterProps {
  showNavigation?: boolean;
  navigationItems?: NavigationItem[];
  showSocialLinks?: boolean;
  showLegalLinks?: boolean;
  variant?: 'default' | 'minimal' | 'tab-bar';
}
```

#### Mobile Features
- **Tab Bar Navigation**: iOS-style bottom tab navigation
- **Touch Targets**: 44px minimum touch targets for all links
- **Social Integration**: Touch-friendly social media links
- **Legal Links**: Accessible terms and privacy links
- **Safe Areas**: Proper spacing for device safe areas
- **Progressive Enhancement**: Basic footer for simple devices

#### Mobile Usage
```tsx
// Mobile-first footer with tab navigation
<Footer
  showNavigation={true}
  navigationItems={footerNavItems}
  showSocialLinks={true}
  showLegalLinks={true}
  variant="tab-bar"
  className="pb-safe-area-inset-bottom"
/>
```

### NavigationItem Interface
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  hapticFeedback?: boolean;
}
```

## ♿ Accessibility Guidelines - Mobile Enhanced

### Component Accessibility - Touch First
- **Touch Targets**: 44px minimum touch targets (48px recommended for thumbs)
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Readers**: Proper ARIA labels, roles, and live regions
- **Focus Management**: Logical tab order and focus trapping for modals
- **Color Contrast**: WCAG AA compliance (4.5:1) across all mobile displays
- **Motion Preferences**: Respects `prefers-reduced-motion` for animations
- **Haptic Feedback**: Optional vibration feedback for important interactions

### Mobile-Specific Accessibility
```typescript
// Accessible touch button with haptic feedback
interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  hapticPattern?: 'light' | 'medium' | 'heavy';
  screenReaderOnly?: boolean;
}

const AccessibleButton = ({
  children,
  hapticPattern = 'light',
  screenReaderOnly = false,
  ...props
}: AccessibleButtonProps) => {
  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate && hapticPattern !== 'none') {
      const patterns = { light: 50, medium: 100, heavy: 200 };
      navigator.vibrate(patterns[hapticPattern]);
    }
  }, [hapticPattern]);

  return (
    <Button
      onClick={(e) => {
        triggerHaptic();
        props.onClick?.(e);
      }}
      className={screenReaderOnly ? 'sr-only' : ''}
      {...props}
    >
      {children}
    </Button>
  );
};
```

### Implementation Examples - Mobile Optimized
```tsx
// Accessible search form for mobile
<form
  role="search"
  aria-label="Search events"
  className="flex gap-2"
>
  <label htmlFor="mobile-search" className="sr-only">
    Search for events, artists, or venues
  </label>
  <Input
    id="mobile-search"
    type="search"
    inputMode="search"
    enterKeyHint="search"
    autoComplete="off"
    autoCapitalize="none"
    placeholder="Search events..."
    className="flex-1 min-h-[44px] text-base"
    aria-describedby="search-help"
  />
  <span id="search-help" className="sr-only">
    Search across all events, artists, and venues on the platform
  </span>
  <Button
    type="submit"
    size="touch"
    aria-label="Submit search"
    hapticFeedback="medium"
  >
    Search
  </Button>
</form>

// Accessible wallet connection with status
<div role="region" aria-label="Wallet connection status">
  <WalletButton
    isConnected={isConnected}
    address={address}
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
    aria-label={isConnected ? `Disconnect wallet ${address}` : 'Connect wallet'}
    aria-describedby="wallet-status"
  />
  <div id="wallet-status" className="sr-only">
    {isConnected
      ? `Connected to wallet with address ${address}. Balance: ${balance} ETH`
      : 'Wallet not connected. Connect to access blockchain features.'
    }
  </div>
</div>
```

## 🎨 Design System Integration

### Using Design Tokens
```tsx
// Component using design tokens
const StyledCard = styled.div`
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-6);

  &:hover {
    background: hsl(var(--card) / 0.7);
    border-color: hsl(var(--primary) / 0.3);
  }
`;
```

### Color Usage
```typescript
// Primary colors
const primaryColors = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
};

// Usage in components
<button
  className="bg-primary text-primary-foreground hover:bg-primary/90"
  style={{ backgroundColor: primaryColors.primary }}
>
  Button
</button>
```

## ⚡ Mobile Performance Optimization

### Touch Performance Patterns
```typescript
// Optimized touch event handling
const useTouchOptimization = () => {
  const [touchState, setTouchState] = useState('idle');

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchState('active');
    // Prevent 300ms click delay on mobile
    e.target.addEventListener('touchend', handleTouchEnd, { once: true });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouchState('idle');
  }, []);

  return { touchState, handleTouchStart };
};

// Battery-conscious animation hook
const useBatteryAwareAnimation = (animation: string) => {
  const [batteryLevel, setBatteryLevel] = useState(100);

  useEffect(() => {
    // Check battery level if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
      });
    }
  }, []);

  // Reduce animations on low battery
  return batteryLevel < 20 ? 'none' : animation;
};
```

### Component Loading Strategies
```typescript
// Progressive component loading for mobile
const ProgressiveCard = ({ children, priority }: {
  children: React.ReactNode;
  priority: 'high' | 'normal' | 'low';
}) => {
  const [isVisible, setIsVisible] = useState(priority === 'high');
  const ref = useRef<HTMLDivElement>(null);

  useIntersectionObserver(ref, () => {
    if (priority !== 'high') {
      setIsVisible(true);
    }
  });

  return (
    <div ref={ref}>
      {isVisible ? children : <SkeletonCard />}
    </div>
  );
};

// Lazy loading with mobile network awareness
const LazyComponent = ({ importFunc, fallback }: {
  importFunc: () => Promise<any>;
  fallback: React.ReactNode;
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Delay loading on slow connections
    const loadComponent = async () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      const module = await importFunc();
      setComponent(() => module.default);
    };

    loadComponent();
  }, [importFunc]);

  return Component ? <Component /> : fallback;
};
```

## 🧪 Testing Components - Mobile Focused

### Mobile Component Test Suite
```typescript
// components/Button.mobile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

// Mock haptic feedback
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
  configurable: true,
});

describe('Button - Mobile', () => {
  beforeEach(() => {
    // Mock touch device
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });
  });

  it('has minimum touch target size', () => {
    render(<Button size="touch">Touch me</Button>);
    const button = screen.getByRole('button');
    const styles = window.getComputedStyle(button);

    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
  });

  it('triggers haptic feedback on touch', () => {
    render(<Button hapticFeedback="medium">Haptic</Button>);
    const button = screen.getByRole('button');

    fireEvent.touchEnd(button);
    expect(navigator.vibrate).toHaveBeenCalledWith(100);
  });

  it('respects reduced motion preferences', () => {
    // Mock reduced motion
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({ matches: true })),
      configurable: true,
    });

    render(<Button>Reduced Motion</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('motion-reduce');
  });

  it('is accessible on mobile', async () => {
    render(<Button aria-label="Accessible action">Action</Button>);
    const button = screen.getByRole('button');

    // Check accessibility attributes
    expect(button).toHaveAttribute('aria-label', 'Accessible action');

    // Test keyboard navigation
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
```

### Visual Regression Testing - Mobile
```typescript
// Mobile visual regression test
const mobileViewports = [
  { width: 375, height: 667, deviceScaleFactor: 2 }, // iPhone SE
  { width: 390, height: 844, deviceScaleFactor: 3 }, // iPhone 12
  { width: 428, height: 926, deviceScaleFactor: 3 }, // iPhone 12 Pro Max
  { width: 360, height: 640, deviceScaleFactor: 3 }, // Android
];

mobileViewports.forEach(({ width, height, deviceScaleFactor }) => {
  test(`Button visual regression on ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height, devicePixelRatio: deviceScaleFactor });
    await page.goto('/components/button');

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot(`button-${width}x${height}.png`);
  });
});
```

## 📚 Usage Examples

### Complete Page Example
```tsx
// pages/index.tsx
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
```

### Form Example
```tsx
// components/EventSearch.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function EventSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/events?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="search"
        placeholder="Search events..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
```

---

**The component library focuses on practical, implementable components that work together to create a cohesive blockchain event platform experience, with mobile-first design and touch optimization at its core.**

<div align="center">

[![Mobile First](https://img.shields.io/badge/Mobile_First_Design-34C759?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com/design/human-interface-guidelines/)
[![Touch Optimized](https://img.shields.io/badge/Touch_Optimized-007AFF?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Accessibility](https://img.shields.io/badge/WCAG_AA_Accessible-6366F1?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/WCAG2AA-Conformance)

</div>