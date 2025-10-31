# 🎯 Zwickly Platform - Complete Feature Guide

## Table of Contents
1. [Student Portal Features](#student-portal-features)
2. [Admin Portal Features](#admin-portal-features)
3. [Social Wall Features](#social-wall-features)
4. [Productivity Tools](#productivity-tools)
5. [Notification System](#notification-system)
6. [Chatbot Features](#chatbot-features)

---

## Student Portal Features

### 🏠 Home Dashboard

**Overview:**
The central hub for all student activities, combining academic tools, social features, and productivity widgets in a responsive 3-column layout.

**Components:**

#### Left Column - Quick Access
- **Student ID Wallet Card**
  - Real-time balance display
  - Quick top-up button
  - Card number and expiry
  - Green gradient design

#### Middle Column - Main Content
- **Interactive Banner Carousel**
  - Auto-playing slides (5s intervals)
  - Featured events and announcements
  - Manual navigation (arrows + dots)
  - "Today's Special" badge overlay
  - Large hero images with gradients

- **Trending Events Section**
  - Grid of upcoming events
  - Category-based color coding
  - Like and Prost counters
  - Registration buttons
  - Event detail modals

- **Activity Feed** (NEW!)
  - Real-time campus updates
  - 4 filter categories:
    - All Activity
    - Announcements
    - Social
    - Events
  - Color-coded activity types
  - Timestamp and user info
  - Auto-refresh via Socket.IO

#### Right Column - Productivity Widgets
- **Greeting Widget**
  - Dynamic time-based greetings
  - Current time display (gradient)
  - Day progress bar
  - Emoji variations

- **Reminder Widget** (NEW!)
  - Today's reminders list
  - Add reminder button
  - Quick actions (Complete, Snooze, Delete)
  - Recurrence options (Once, Daily, Weekdays)
  - Color-coded by urgency
  - Auto-refresh on trigger

- **Note Taker Widget** (NEW!)
  - Quick note capture
  - Title + content fields
  - Pin to top feature
  - Mark as done
  - Delete notes
  - localStorage persistence

- **Study Planner Widget** (NEW!)
  - Pomodoro Timer:
    - 25 min work / 5 min break
    - Start/Pause/Reset controls
    - Session counter
    - Sound notification
  - Assignment Tracker:
    - Add assignments with due dates
    - Completion checkboxes
    - Urgency indicators (Today, Tomorrow, This Week)
    - Auto-creates reminders (1 day before, 9 AM)
    - Delete assignments

- **Calendar Widget**
  - Monthly view
  - Event markers on dates
  - Quick navigation
  - Today highlight

---

### 📅 Timetable Page

**Features:**
- **Day Selector**
  - Monday to Friday tabs
  - Active day highlighted
  - Smooth transitions

- **Class Display**
  - Course name and code
  - Start and end time
  - Room number
  - Instructor name
  - Color-coded by subject

- **Actions**
  - Export to calendar (iCal)
  - Print view
  - Share schedule

**Data Source:**
- PostgreSQL `timetable` table
- Dynamic filtering by day and semester group

---

### 📝 Exams Page

**Features:**
- **Exam List**
  - Course name
  - Exam date and time
  - Location/room
  - Lecturer name
  - Format (written/oral)

- **Countdown Timer**
  - Days until each exam
  - Color-coded urgency

- **Reminders**
  - Auto-create exam reminders
  - Customizable timing

---

### 🎉 Events Page

**Features:**
- **Category Filters**
  - All Events
  - Career
  - Tech
  - Music
  - Sports
  - Social

- **Event Cards**
  - Large hero image
  - Event title and category
  - Date, time, location
  - Like and Prost counters
  - Registration status

- **Event Details Modal**
  - Full description
  - Organizer information
  - Registration info
  - Language
  - Actions:
    - Register/Unregister
    - Like event
    - Set Reminder (NEW!)
    - Upload Prost image

- **Beverage Detection**
  - AI-powered image analysis
  - Auto-increment Prost counter
  - Fun campus tradition

---

### 🍽️ Mensa Page

**Features:**
- **Daily Menu**
  - Breakfast, lunch, dinner sections
  - Meal descriptions
  - Prices
  - Dietary icons (vegetarian, vegan, gluten-free)

- **Weekly View**
  - Day-by-day navigation
  - Menu previews

- **Favorites**
  - Save favorite meals
  - Get notified when available

---

### 📰 News Page

**Features:**
- **University Announcements**
  - Latest news from administration
  - Event announcements
  - Policy updates

- **Campus Blog**
  - Student stories
  - Faculty interviews
  - Research highlights

- **Filters**
  - By category
  - By date
  - By relevance

---

### 🚌 Transport Page

**Features:**
- **VMS Schedule**
  - Bus and tram timings
  - Route information
  - Stop locations

- **Real-time Updates**
  - Delays and cancellations
  - Platform changes

- **Favorites**
  - Save frequent routes
  - Quick access

---

## Admin Portal Features

### 🔧 KommPakt Dashboard

**Overview:**
Administrative interface for managing events, social wall, and user support.

**Access:** `http://localhost:8080/admin/home`

---

### 📊 Analytics Dashboard

**Metrics:**
- Event registration counts
- Social wall engagement
- User activity trends
- Top events and channels

**Visualizations:**
- Line charts (time series)
- Bar charts (comparisons)
- Pie charts (distributions)
- Heat maps (activity patterns)

---

### 🎉 Event Management

**Create Event:**
```
Form Fields:
- Title (required)
- Location
- Date & Time
- Category (Career, Tech, Music, Sports, Social)
- Description (rich text)
- Language (German, English, Both)
- Registration Info
- Image Upload

Publishing Options:
☑ Publish to Banner Slider
☑ Publish to Social Wall
  └─> Select Channel (dropdown)
```

**Event List:**
- Search and filter
- Edit existing events
- Delete events
- View registrations
- Export attendee list

**Event Analytics:**
- Registration count
- Likes and Prosts
- Views and shares
- Demographics breakdown

---

### 💬 Social Wall Administration

**Access:** `http://localhost:8080/admin/social`

**Channel Management:**

1. **Create New Channel**
   - Name
   - Description
   - Public/Private toggle
   - Auto-approve students

2. **Manage Existing Channels**
   - View member count
   - See message history
   - Pin important messages
   - Archive old channels
   - Delete channels (bulk support)

3. **Channel Requests**
   - View pending requests
   - Approve/Decline buttons
   - Request details (user, reason)
   - Auto-notify requester

**Admin Controls:**

- **Send Message**
  - Select channel(s) (multi-select support)
  - Rich text editor
  - @mention users
  - Image attachments
  - Broadcast to all

- **Create Poll**
  - Question field
  - Add/remove options
  - Set duration
  - Close poll manually
  - View results in real-time

- **Upload Image**
  - Drag-and-drop or browse
  - Image preview
  - Automatic optimization
  - Multi-channel posting

- **Message History**
  - View all messages in channel
  - Filter by user/date
  - Delete inappropriate content
  - Export chat logs

- **Image Gallery**
  - View all uploaded images
  - Delete images
  - Download originals

- **Poll Management**
  - View all polls
  - See vote counts
  - Close/reopen polls
  - Export results

**Support Tickets:**

- **Ticket List**
  - User name and issue
  - Created timestamp
  - Priority (low, normal, high, urgent)
  - Status (open, in progress, resolved, closed)

- **Ticket Details**
  - Full description
  - Channel and message context
  - User contact info

- **Ticket Actions**
  - Reply to user
  - Change status
  - Assign to admin
  - Close ticket
  - Auto-notify user on reply

---

## Social Wall Features

### 💬 Student Social Wall

**Access:** `http://localhost:8080/social`

**Layout:**
- **Left Sidebar:** Channel list
- **Center:** Message feed
- **Right:** Message composer

---

### Channels

**Predefined Channels:**
1. **Tivoli General** (Public)
   - General campus discussion
   - Auto-join for all students

2. **Zwickau International** (Public)
   - International student community
   - Multi-language support

3. **MIT Class 2A** (Private)
   - Class-specific group
   - Restricted to enrolled students

4. **Campus Events** (Public, Read-Only)
   - Official event announcements
   - Admin posts only

5. **Study Group - AI** (Public)
   - AI course study group
   - Student-created

**Channel Features:**
- Member count badge
- Unread message indicator (gradient badge)
- Lock icon for private channels
- Active state highlighting
- Search/filter channels

**Create Channel Request:**
- Button: "+ Request New Channel"
- Form fields:
  - Channel name
  - Description
  - Public/Private
  - Reason for creation
- Submits to admin for approval
- Notification on approval/decline

---

### Messaging

**Send Messages:**
- Type in composer
- Press Enter or click Send
- Shift+Enter for new line
- Max 1000 characters

**@Mentions:**
- Type @ to see user list
- Auto-complete suggestions
- Notifies mentioned user
- Highlighted in message

**@pixi Bot:**
- Query campus information
- Commands:
  - `@pixi timetable [day]`
  - `@pixi exams`
  - `@pixi events`
  - `@pixi help`
- Instant bot responses
- Formatted results

**@admin Mentions:**
- Type `@admin` in any message
- Auto-creates support ticket
- Notifies admin team
- One ticket per user (consolidated)
- Ticket visible in admin portal

**Message Display:**
- User avatar (colored circles)
- Username and timestamp
- Message body
- Images (inline display)
- Polls (interactive)
- Bot badge for @pixi responses

---

### Polls

**View Polls:**
- Question displayed prominently
- Multiple choice options
- Current vote percentages
- Progress bars
- Total vote count

**Vote on Polls:**
- Click option to vote
- Instant visual feedback
- Real-time result updates
- One vote per user
- Cannot change vote

**Poll States:**
- Active (can vote)
- Closed (results only)
- Pending (not yet open)

---

### Image Sharing

**Upload Images:**
- Click image icon in composer
- Select image file (JPEG, PNG, GIF)
- Max 5MB per image
- Preview before sending
- Auto-resize for optimization

**View Images:**
- Inline thumbnails in messages
- Click to enlarge
- Gallery view
- Download original

---

## Productivity Tools

### ⏰ Smart Reminders

**Create Reminder:**
```
Form Fields:
- Title (required)
- Description (optional)
- Date (date picker)
- Time (time picker)
- Recurrence:
  • One-time
  • Daily (every day)
  • Weekdays (Mon-Fri only)
```

**Reminder Sources:**
1. **Manual** - User-created via widget
2. **Events** - Auto-created on event registration (24h before)
3. **Assignments** - Auto-created from Study Planner (1 day before, 9 AM)
4. **Calendar** - Synced from external calendars

**Reminder Display:**
- Today's reminders (top section)
- Upcoming reminders (scrollable list)
- Color-coded by urgency:
  - Red: Overdue
  - Orange: Today
  - Green: Tomorrow
  - Blue: This week
  - Gray: Later

**Reminder Actions:**
- ✓ Mark Complete
- 💤 Snooze (10, 30, 60 min, 1 day)
- 🗑️ Delete
- ✏️ Edit

**Notification Channels (5):**

1. **🔊 Sound Alert**
   - Plays audio file
   - Volume: 50%
   - Graceful fallback

2. **🖥️ Desktop Notification**
   - Browser native
   - Shows when tab inactive
   - Requires user interaction
   - Permission requested on first use

3. **📱 In-App Toast**
   - Red error level (prominent)
   - 10-second duration
   - Action buttons:
     - "Snooze 10m"
     - "Complete"

4. **📰 Activity Feed**
   - Appears as activity item
   - Persists in feed
   - Real-time via Socket.IO

5. **📲 Push Notification**
   - Via VAPID
   - Works when app closed
   - Sent by scheduler

**Recurrence Handling:**
- **Once:** Marks complete after trigger
- **Daily:** Creates next day's reminder automatically
- **Weekdays:** Creates next weekday reminder (skips Sat/Sun)

---

### 📝 Note Taker

**Features:**
- **Quick Capture**
  - Title + content fields
  - Auto-save (3s debounce)
  - localStorage persistence

- **Organization**
  - Pin important notes (stays at top)
  - Mark as done (strikethrough)
  - Delete notes

- **Display**
  - Card-based layout
  - Color-coded status:
    - Pinned: Purple border
    - Done: Gray with strikethrough
    - Active: White

- **Actions**
  - 📌 Pin/Unpin
  - ✓ Done/Undone
  - 🗑️ Delete

**Use Cases:**
- Quick lecture notes
- Homework reminders
- Personal todos
- Ideas and brainstorming

---

### ⏱️ Study Planner

**Pomodoro Timer:**
```
Configuration:
- Work duration: 25 minutes
- Break duration: 5 minutes
- Auto-start breaks: Yes
- Sound notification: Yes
```

**Features:**
- Start/Pause/Reset buttons
- Progress bar
- Time remaining display
- Session counter
- Focus mode (minimal distractions)

**Timer States:**
- **Work:** Red theme, focus music
- **Break:** Green theme, relaxation prompt
- **Paused:** Yellow theme

**Assignment Tracker:**

**Add Assignment:**
```
Fields:
- Assignment name
- Due date (date picker)
- Priority (optional)
```

**Assignment Display:**
- Checkbox (complete/incomplete)
- Assignment name
- Due date
- Urgency label:
  - 🔴 "Due Today"
  - 🟠 "Due Tomorrow"
  - 🟢 "This Week"
  - ⚪ "Later"

**Auto-Reminder Creation:**
- When assignment added with due date
- Creates reminder for 1 day before at 9 AM
- Source: `study_plan`
- Toast confirms: "Assignment and reminder added!"

**Actions:**
- ✓ Mark complete
- 🗑️ Delete
- ✏️ Edit due date

---

### 📰 Activity Feed

**Purpose:**
Real-time feed of campus activities and updates.

**Activity Types:**
1. **Admin Announcements**
   - Icon: 📢
   - Color: Purple
   - Example: "New campus policy announced"

2. **Event Published/Updated**
   - Icon: 🎉
   - Color: Blue
   - Example: "Tech Talk scheduled for Feb 15"

3. **Poll Created/Closed**
   - Icon: 📊
   - Color: Green
   - Example: "New poll: Best study spot?"

4. **Channel Message** (Public only)
   - Icon: 💬
   - Color: Teal
   - Example: "5 new messages in Tivoli General"

5. **Ticket Updates**
   - Icon: 🎫
   - Color: Orange
   - Example: "Your ticket #123 was resolved"

6. **@Mentions**
   - Icon: @
   - Color: Red
   - Example: "You were mentioned in MIT Class 2A"

7. **Social Highlights**
   - Icon: ⭐
   - Color: Yellow
   - Example: "Most voted post: Pizza party proposal"

**Filters:**
- All Activity (default)
- Announcements
- Social
- Events

**Display:**
- Scrollable list
- Timestamp (relative: "2 min ago")
- User/source info
- Click to view details

**Data Sources:**
- `/api/notifications` (REST)
- Socket.IO events (real-time)
- Fallback: REST polling (10s)

---

## Notification System

### Notification Center

**Access:**
- Bell icon in navbar
- Badge shows unread count

**Notification Types:**
1. `channel_request_submitted` - Your channel request submitted
2. `channel_request_approved` - Channel request approved
3. `channel_request_declined` - Channel request declined
4. `admin_channel_request_new` - New channel request (admin)
5. `admin_ticket_new` - New support ticket (admin)
6. `reminder` - Reminder triggered
7. `mention` - You were mentioned
8. `poll_created` - New poll in channel
9. `event_published` - New event published

**Notification Display:**
- Icon based on type
- Title and message
- Timestamp
- Read/Unread status
- Click to mark read

**Actions:**
- Mark as Read
- Mark All as Read
- Delete notification
- View source (event, message, etc.)

---

### Push Notifications (VAPID)

**Setup:**
1. User grants permission
2. Browser generates subscription
3. Subscription saved to database
4. Backend sends push via web-push library

**Triggers:**
- Reminder due
- @mention
- Event registration confirmed
- Ticket replied
- Channel request approved/declined

**Payload:**
```json
{
  "title": "Reminder: Assignment due tomorrow",
  "body": "Don't forget to submit ML homework",
  "icon": "/zwickly-icon.png",
  "badge": "/badge-icon.png",
  "tag": "reminder-123",
  "requireInteraction": true,
  "data": {
    "url": "/social",
    "reminderId": "uuid"
  }
}
```

---

## Chatbot Features

### 🤖 Pixie AI Assistant

**Access:** `http://localhost:8080/chatbot`

**Interface:**
- Chat bubble design
- Message history
- Typing indicator
- Quick reply buttons

**Capabilities:**

1. **Timetable Queries**
   - "What's my timetable for Monday?"
   - "When is my next class?"
   - "Show me this week's schedule"

2. **Exam Information**
   - "When are my exams?"
   - "What's the next exam?"
   - "Exam schedule"

3. **Event Listings**
   - "What events are coming up?"
   - "Events this week"
   - "Tech events"

4. **Mensa Menu**
   - "What's for lunch today?"
   - "Mensa menu"
   - "Vegetarian options"

5. **Transport Info**
   - "Bus schedule"
   - "How to get to campus?"

6. **General Help**
   - "Help"
   - "What can you do?"

**Response Format:**
- Plain text for simple queries
- Structured cards for complex data
- Quick action buttons
- Links to detailed pages

**Integration in Social Wall:**
- Mention `@pixi` in any channel
- Instant bot response
- Bot badge on messages
- All students can use

---

## Feature Comparison Matrix

| Feature | Student | Admin | Notes |
|---------|---------|-------|-------|
| View Timetable | ✅ | ❌ | Read-only |
| View Events | ✅ | ✅ | Admin can edit |
| Create Events | ❌ | ✅ | Admin only |
| Register for Events | ✅ | ✅ | Both can register |
| Social Wall Messaging | ✅ | ✅ | Admin can broadcast |
| Create Channels | ❌ | ✅ | Students request |
| Request Channels | ✅ | ❌ | Admin approves |
| Create Polls | ❌ | ✅ | Admin only |
| Vote on Polls | ✅ | ✅ | Both can vote |
| @pixi Queries | ✅ | ✅ | Bot available to all |
| Create Tickets | ✅ | ❌ | Via @admin mention |
| Manage Tickets | ❌ | ✅ | Admin responds |
| Create Reminders | ✅ | ✅ | Personal use |
| Take Notes | ✅ | ✅ | localStorage |
| Use Pomodoro | ✅ | ✅ | Study tool |
| View Analytics | ❌ | ✅ | Admin dashboard |

---

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + K` - Open search
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + R` - Add reminder
- `Ctrl/Cmd + /` - Toggle sidebar

### Social Wall
- `Ctrl/Cmd + Enter` - Send message
- `Shift + Enter` - New line
- `@` - Mention user (auto-complete)
- `Esc` - Close modals

### Pomodoro Timer
- `Space` - Start/Pause
- `R` - Reset
- `S` - Skip break

---

## Mobile Responsiveness

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Single column layout
- Collapsible sidebar
- Bottom navigation
- Swipe gestures
- Touch-optimized buttons
- Reduced animations

---

## Accessibility Features

- WCAG AA+ compliant
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels
- Semantic HTML
- Alt text for images

---

**Guide Version:** 1.0.0
**Last Updated:** October 2025
**For Questions:** Contact KommPakt Team

