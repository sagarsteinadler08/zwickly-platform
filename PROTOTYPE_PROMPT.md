# Zwickly Student Life App - Prototype Generation Prompt

Use this prompt in your prototype generation tool (Figma, Lovable, etc.) to create a comprehensive UI/UX design for the Zwickly student life platform.

---

## PROJECT CONTEXT

**App Name:** Zwickly Student Life Platform
**Type:** Student campus management web application
**Target Users:** University students (WHZ - Westsächsische Hochschule Zwickau)
**Platform:** Web app (responsive, mobile-first design)

---

## CORE FEATURES TO DESIGN

### 1. HOME PAGE (Dashboard)
- **Gradient Header Section:**
  - Large header with gradient background (purple #7B5CFA to cyan #48E0E4)
  - Left: App logo "Zwickly" in bold white text
  - Right: User profile avatar (circular, 48px)
  - Rounded bottom corners (24px radius)
  - Subtitle: "Your Campus Companion"

- **Greeting Section:**
  - "Good Morning, [User Name] 👋"
  - Current date display
  - User avatar or profile picture

- **Quick Actions Grid (4 buttons):**
  - Timetable (calendar icon)
  - Social Wall (people icon)
  - Ask Pixi (chat bubble icon)
  - My Space (house icon)
  - Each button: Square, rounded corners, purple/cyan gradient background, white icon

- **Carousel/Slider Section:**
  - Large featured card (Mensa Menu, Events, News)
  - Image background with overlay
  - Title and subtitle text
  - "View Details" button
  - Navigation arrows and pagination dots

- **Upcoming Events:**
  - Grid of 2x2 event cards
  - Each card: Event image, title, date, time, location, category badge
  - "View Details" button on each card

- **Recent Updates:**
  - List of notification cards
  - Each card: Icon, title, description, timestamp
  - "New" badges for unread items

### 2. EVENTS PAGE
- **Gradient Header:**
  - Full-width gradient (purple to cyan)
  - Title: "Campus Events" (large, white, bold)
  - Subtitle: "Discover and join exciting events"
  - Rounded bottom corners

- **Filter Bar (Sticky):**
  - Horizontal scrollable chip buttons
  - Filter icon on left
  - Chips: "All" (selected - purple fill), "Joined", "Upcoming", category names
  - Selected chip: Purple background, white text
  - Unselected chip: White background, purple border, purple text

- **Event Cards Grid:**
  - Responsive grid (1 column mobile, 2 tablet, 3 desktop)
  - Each card:
    - Top: Event image (full width, 48px height ratio)
    - Category badge (top-right corner, dark gray/black with white text)
    - Content area (white background):
      - Event title (bold, dark gray)
      - Date icon + date text (purple icon)
      - Clock icon + time (purple icon)
      - Location icon + location (purple icon)
      - Attendees count (optional)
    - Bottom: Purple gradient button "View Details" (full width)
  - Cards have soft shadows and rounded corners (12px)

### 3. EVENT DETAIL MODAL
- **Modal Style:**
  - Gradient background (light purple to white)
  - Rounded corners (16px)
  - Large shadow
  - Close button (top-right X)

- **Content:**
  - Event image (full width at top)
  - Title (large, bold)
  - Date, time, location (with purple icons)
  - Description text
  - Category badge
  - Like and Prost counters
  - "Register" button (purple gradient)
  - Registration info

### 4. PROFILE PAGE
- **Gradient Header:**
  - Same gradient as other pages
  - Title: "Profile"
  - Subtitle: "Manage your account settings"

- **Profile Card:**
  - Large white card with shadow
  - Circular avatar (top center, 120px)
  - Name (centered, bold)
  - Email (centered, gray)
  - ID number (centered, small gray)
  - "Student" badge (purple background)

- **Preferences Section:**
  - "Preferences" heading
  - Toggle cards:
    - Push Notifications (icon + title + subtitle + toggle switch)
    - Dark Mode (icon + title + subtitle + toggle switch)

- **General Section:**
  - "General" heading
  - Settings cards with arrow icons:
    - Account Settings
    - Help & Support
    - About

### 5. CHATBOT PAGE (Pixi)
- **Gradient Header:**
  - Gradient background
  - Left: Robot/bot icon (circular, purple)
  - Title: "Pixi"
  - Subtitle: "Your Campus Buddy 🤖"

- **Quick Questions Grid:**
  - 2x2 grid of question cards
  - Each: White card, rounded corners, question text
  - Examples: "What's my schedule today?", "How far is Zentrum?", "What's for lunch?", "Any events today?"

- **Chat Interface:**
  - Chat bubbles (white background, rounded)
  - Bot message: Left-aligned
  - User message: Right-aligned (purple background)
  - Timestamp below each message
  - Input field at bottom (purple border on focus)

---

## DESIGN TOKENS / STYLE GUIDE

### Colors:
- **Primary Purple:** #7B5CFA
- **Primary Dark:** #6A4BE9
- **Accent Cyan:** #48E0E4
- **Background Soft:** #F9F6FF
- **Card Background:** #FFFFFF
- **Text Primary:** #0F0F0F (dark gray/black)
- **Text Muted:** #6B7280 (medium gray)
- **Success:** #10B981 (green)
- **Warning:** #F59E0B (orange)
- **Error:** #EF4444 (red)

### Typography:
- **Font Family:** Sans-serif, clean and modern
- **Headings:** Bold, varying sizes (2xl-4xl)
- **Body:** Regular weight, readable sizes
- **Small Text:** 0.75rem - 0.875rem for labels/badges

### Spacing:
- **Small Gap:** 8px
- **Medium Gap:** 16px
- **Large Gap:** 24px
- **Padding:** Consistent 16px-24px on cards

### Border Radius:
- **Small:** 8px
- **Medium:** 12px
- **Large:** 20px
- **XLarge:** 24px (header bottom corners)
- **Full:** 9999px (pills, avatars, buttons)

### Shadows:
- **Small:** 0 4px 12px rgba(123,92,250,0.08)
- **Medium:** 0 8px 24px rgba(123,92,250,0.12)
- **Large:** 0 12px 36px rgba(15,15,15,0.15)

### Buttons:
- **Primary:** Purple gradient background, white text, rounded-full, padding 0.5rem 1rem
- **Outline:** White background, purple border (2px), purple text, rounded-full
- **Hover:** Slight brightness increase or border color change

### Cards:
- **Background:** White (#FFFFFF)
- **Border:** None (rely on shadows)
- **Radius:** 12px
- **Shadow:** Soft purple-tinted shadow
- **Padding:** 16px
- **Hover:** Slight elevation increase (transform: translateY(-2px))

---

## COMPONENT SPECIFICATIONS

### Gradient Header:
- Height: ~120-150px
- Background: Linear gradient (left: #7B5CFA, right: #48E0E4)
- Border radius bottom: 24px
- Padding: 24px horizontal, 32px vertical
- White text throughout

### Filter Chips:
- Height: ~36px
- Padding: 8px 16px
- Border radius: 9999px (pill shape)
- Selected: Purple fill, white text
- Unselected: White fill, purple border (2px), purple text
- Font: 0.875rem, medium weight

### Event Cards:
- Width: Responsive (100% mobile, ~300px desktop)
- Border radius: 12px
- Shadow: Medium shadow
- Image: Aspect ratio 16:9 or 4:3
- Content padding: 16px
- Button: Full width, purple gradient

### Modal/Dialog:
- Background: Gradient (white to very light purple)
- Border radius: 16px
- Max width: 600px
- Padding: 24px
- Shadow: Large shadow
- Close button: Top-right corner (X icon)

### Navigation Bar (if using bottom nav on mobile):
- Fixed bottom
- White background
- 5 icons: Home, Events, Social, Pixi, Profile
- Active state: Purple icon + underline
- Inactive: Gray icon
- Notification badge: Red circle with number on Profile

---

## RESPONSIVE BREAKPOINTS

### Mobile (< 640px):
- Single column layouts
- Header padding reduced (16px)
- Cards full width
- Bottom navigation bar visible
- Filter chips scroll horizontally

### Tablet (640px - 1024px):
- 2-column grids for cards
- Standard header padding
- Top navigation visible

### Desktop (> 1024px):
- 3-4 column grids
- Full header
- Sidebar navigation (optional)

---

## INTERACTIVE STATES

### Buttons:
- Default: Base styles
- Hover: Brightness increase, slight elevation
- Active: Pressed state (translateY 1px)
- Disabled: Opacity 50%, no cursor

### Cards:
- Default: Base shadow
- Hover: Increased shadow, slight lift
- Click: Ripple or scale effect (optional)

### Inputs:
- Default: Light border
- Focus: Purple border (2px), purple shadow ring (6px spread)
- Error: Red border (if validation fails)

---

## ACCESSIBILITY REQUIREMENTS

- Color contrast ratios meet WCAG AA (4.5:1 for text)
- Interactive elements minimum 44x44px touch target
- Focus states clearly visible
- Screen reader friendly labels
- Keyboard navigation support

---

## ANIMATIONS & TRANSITIONS

- All transitions: 200ms ease
- Card hover: 200ms ease
- Button press: 100ms translateY
- Modal open: Fade + scale (300ms)
- Page transitions: Fade (200ms)

---

## TECHNICAL CONSTRAINTS FOR IMPLEMENTATION

- **Framework:** React with TypeScript
- **Styling:** CSS with Tailwind CSS utilities
- **Components:** Reusable Card, Button, Input, Badge, Avatar, Modal components
- **State Management:** React hooks (useState, useEffect)
- **Routing:** React Router DOM
- **API:** REST API endpoints (events, timetable, news, etc.)
- **No Breaking Changes:** All existing API calls must work unchanged

---

## WHAT TO INCLUDE IN PROTOTYPE

1. **Complete Visual Design:**
   - All pages fully designed
   - All components styled
   - Color palette applied
   - Typography system
   - Spacing system

2. **Interactive Elements:**
   - Clickable buttons
   - Hover states
   - Active/selected states
   - Form inputs
   - Modal/dialog examples

3. **Multiple Screen Sizes:**
   - Mobile (375px, 414px)
   - Tablet (768px)
   - Desktop (1024px, 1440px)

4. **Asset Specifications:**
   - Icon sizes (24px, 32px, 48px)
   - Image dimensions
   - Avatar sizes
   - Logo sizes

5. **Design System Documentation:**
   - Color codes
   - Typography scale
   - Component library
   - Spacing guide

---

## OUTPUT FORMAT NEEDED

When you generate the prototype, please provide:
1. Screenshots or export of all pages
2. Design token values (colors, spacing, typography)
3. Component specifications
4. Any additional design notes
5. Interactive prototype link (if using Figma/Lovable)

This will allow me to perfectly match your prototype in the webapp implementation.

---

**Note:** The implementation must preserve all existing functionality - only visual styling changes. No API endpoints, database schemas, or routing logic should change.

