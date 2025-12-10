# Restaurant Ordering System Design Guidelines

## Design Approach
**Reference-Based**: Inspired by Toast POS and Square for Restaurants for professional admin interfaces, combined with Uber Eats-style customer experience. Dark theme throughout with modern food-tech aesthetics.

## Core Design Principles
1. **Professional Restaurant Tech**: Clean, efficient interfaces optimized for high-volume order management
2. **Dark Mode Excellence**: Sophisticated dark theme with glassmorphism elevation
3. **Real-Time Clarity**: Clear visual feedback for order status changes and updates
4. **Mobile-First Service**: Optimized for customers scanning QR codes on mobile devices

## Color System (User-Specified)
- **Primary**: #1A1A1A (Deep Black) - Main backgrounds, headers
- **Secondary**: #2D2D2D (Charcoal) - Secondary surfaces
- **Accent**: #FF6B35 (Vibrant Orange) - CTAs, active states, highlights
- **Success**: #00D9A5 (Emerald Green) - Confirmed orders, completed states
- **Warning**: #FFC107 (Amber) - Pending actions, notifications
- **Background**: #121212 (Dark Mode Black) - Page backgrounds
- **Card Background**: #1E1E1E (Elevated Dark) - Cards, panels with glassmorphism
- **Text**: #E0E0E0 (Light Grey) - Primary text
- **Subtle Text**: #9E9E9E (Medium Grey) - Secondary text, labels

## Typography
- **Font Stack**: Poppins (headings), Inter (body), SF Pro Display (iOS optimization)
- **Hierarchy**:
  - Page titles: 32px bold
  - Section headers: 24px semibold
  - Card titles: 18px semibold
  - Body text: 16px regular
  - Small text/labels: 14px regular
  - Captions: 12px regular

## Layout System
**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 16, 24 (generous 24px spacing as specified)
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6
- Element margins: mb-4, mb-6, mb-8

**Grid System**:
- Admin dashboard: 3-column order cards on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Menu items: 2-column on tablet, single on mobile
- Table management: Grid layout for QR codes

## Component Library

### Admin Panel Components
**QR Code Generator Cards**: Elevated cards with glassmorphism, table number prominently displayed, downloadable QR code, copy table URL button with #FF6B35 accent

**Order Management Dashboard**: Card-based layout, each order card showing table number badge, itemized list, status indicator with color coding, action buttons for status progression

**Table Status Overview**: Grid of table cards showing occupancy status (Available/Occupied), current order value, time elapsed

### Customer-Facing Components
**Digital Menu**: Card-based menu items with food imagery, pricing, customization badges, add-to-cart buttons with orange accent

**Order Customization Modal**: Glassmorphic overlay, spice level selector (visual indicators), add-ons with checkboxes, special instructions textarea, dynamic price preview

**Order Status Tracker**: Horizontal progress stepper with 5 stages, animated transitions between states, color-coded indicators (grey → orange → green)

**Bill Summary**: Itemized breakdown card, subtotal/tax/total clearly separated, prominent payment button

### Shared Components
**Floating Action Buttons**: Fixed position CTAs with #FF6B35 background, subtle shadow, micro-interactions on tap

**Status Badges**: Pill-shaped with appropriate colors (Received: #FFC107, Preparing: #FF6B35, Cooking: #FF6B35, Ready: #00D9A5, Served: #00D9A5)

**Loading States**: Skeleton screens with subtle shimmer, loading spinners with orange accent

## Glassmorphism Implementation
- Background: rgba(30, 30, 30, 0.8)
- Backdrop blur: backdrop-blur-lg
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border radius: 20px (as specified)
- Box shadow: Elevated with subtle glow

## Animations & Interactions
- **Order Updates**: Pulse animation on status change, slide-in notifications
- **Button States**: Smooth scale on hover (scale-105), active state (scale-95)
- **Card Hover**: Subtle lift (translateY(-4px)), enhanced shadow
- **Transitions**: 200-300ms ease-in-out for most interactions
- **Progress Indicators**: Animated fill states, checkmark reveals

## Responsive Breakpoints
- Mobile: < 768px (single column, full-width cards)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (3-column admin grids, side-by-side layouts)

## Images
No hero images needed. Focus on:
- **Menu Item Photos**: High-quality food photography in menu cards
- **Table QR Codes**: Dynamically generated QR codes in admin panel
- **Empty States**: Minimal illustrations for "no orders" states

## Accessibility
- Maintain WCAG AA contrast ratios (light text on dark backgrounds)
- Focus indicators: 2px orange outline on interactive elements
- Status conveyed through icons + text, not color alone
- Touch targets: Minimum 44px for mobile buttons
- Keyboard navigation for admin panel

## Key UX Patterns
- **Session Management**: Table number persists via URL params, localStorage backup
- **Real-Time Updates**: WebSocket connection indicator, auto-refresh on reconnect
- **Payment Flow**: Clear 3-step process (Review → Payment → Confirmation)
- **Role Separation**: Distinct visual identity for admin vs. customer views
- **Error Handling**: Toast notifications with appropriate color coding