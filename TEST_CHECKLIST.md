# Social Wall Test Checklist

## ✅ Pre-Test Setup
- [ ] All services running (frontend, backend, Socket.IO, database)
- [ ] Browser console open (F12)
- [ ] Network tab enabled
- [ ] Local storage cleared if needed

---

## 🌐 Page Load Tests

### Homepage
- [ ] `http://localhost:8080` loads without errors
- [ ] Navigation menu visible
- [ ] Click "Social" navigates to `/social`

### Social Page Load
- [ ] `http://localhost:8080/social` loads
- [ ] No console errors on page load
- [ ] "Loading Social Wall..." flash appears briefly (SSR check)
- [ ] Channel list sidebar visible
- [ ] Main content area visible

### Loading States
- [ ] "Loading channels..." appears in sidebar briefly
- [ ] "Select or join a channel to get started" shows when no channel selected
- [ ] All loading states show appropriate messages

---

## 📋 Channel List Tests

### Channel Display
- [ ] At least 4 channels visible: Tivoli Fun, Zwickau International, Random, MIT Class
- [ ] Channel names displayed correctly
- [ ] Channel descriptions visible (if available)
- [ ] Unread badges shown (if any)

### Channel Selection
- [ ] Click channel selects it (highlighted)
- [ ] Message area appears
- [ ] Channel header shows correct name
- [ ] Can switch between channels

### New Channel Request
- [ ] Click "+ New" button opens request form
- [ ] Can type channel name (max 50 chars)
- [ ] Can type description (max 120 chars)
- [ ] "Submit" button works
- [ ] Success toast appears: "Channel request sent!"
- [ ] Form closes after submission

---

## 💬 Message Tests

### Viewing Messages
- [ ] Messages load from API
- [ ] Older messages visible
- [ ] New messages appear in real-time
- [ ] Bot messages (Pixi) styled differently
- [ ] Image messages display correctly
- [ ] Timestamps formatted correctly

### Sending Messages
- [ ] Type message and press "Send" (or Enter)
- [ ] Message appears immediately
- [ ] Input clears after sending
- [ ] Rate limit works (1 msg/2s - try sending too fast)
- [ ] "You're sending too fast!" toast appears

### Special Features
- [ ] **@admin mention**: Type "@admin I need help"
- [ ] Verify ticket created in admin portal
- [ ] **@pixi bot**: Type "@pixi timetable"
- [ ] Bot responds with timetable data
- [ ] **Image upload**: Click 📎, select image
- [ ] Image preview shows before upload
- [ ] Image uploads successfully
- [ ] Image appears in message

### Image Upload Edge Cases
- [ ] Try uploading file >5MB → error shown
- [ ] Try uploading wrong type → error shown
- [ ] Try uploading without selecting file → no error (correct)

---

## 📊 Poll Tests

### Viewing Polls
- [ ] Polls load for channel (if any exist)
- [ ] Poll question visible
- [ ] Poll options visible
- [ ] Current vote counts displayed
- [ ] "Results (X votes)" text shown

### Voting
- [ ] Can select radio button
- [ ] "Vote" button enabled after selection
- [ ] Click "Vote" updates results
- [ ] Cannot vote again (double-vote prevention)
- [ ] Results update in real-time

---

## 🔔 Notification Tests

### Toasts
- [ ] Success toast appears (e.g., after request)
- [ ] Error toast appears (e.g., upload failure)
- [ ] Toast auto-dismisses after 4 seconds
- [ ] Can click × to close manually
- [ ] Toast positioning correct (bottom-right)

### Push Notifications
- [ ] Test push subscription (if implemented)
- [ ] Browser prompts for permission
- [ ] Can accept/deny permission

---

## 🔌 Socket.IO Tests

### Connection
- [ ] Socket connects automatically
- [ ] No WebSocket errors in console
- [ ] Connection status indicated (if visible)
- [ ] Can disconnect/reconnect gracefully

### Real-time Updates
- [ ] New message from other user appears instantly
- [ ] No duplicate messages
- [ ] Poll updates appear immediately
- [ ] Typing indicators (if implemented)

---

## 🛡️ Error Handling Tests

### Network Errors
- [ ] Disable network → shows appropriate error
- [ ] Re-enable network → reconnects
- [ ] Can retry failed operations

### API Errors
- [ ] 404 errors handled gracefully
- [ ] 500 errors show user-friendly message
- [ ] Errors logged to console for debugging

### Edge Cases
- [ ] Send empty message → prevented
- [ ] Send too fast → rate limited
- [ ] Try actions when not connected → shows error
- [ ] Refresh page during chat → resumes correctly

---

## ♿ Accessibility Tests

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Enter submits forms
- [ ] Shift+Enter creates new line (in composer)
- [ ] Escape closes modals

### Screen Reader
- [ ] ARIA labels present on buttons
- [ ] Role attributes correct
- [ ] Alt text on images (if applicable)

---

## 📱 Responsive Tests

### Mobile View (resize to <768px)
- [ ] Sidebar collapses
- [ ] Hamburger menu (☰) visible
- [ ] Click hamburger opens sidebar
- [ ] Click "←" closes sidebar
- [ ] Main content adjusts properly

### Desktop View (>768px)
- [ ] Sidebar always visible
- [ ] No hamburger menu
- [ ] Proper layout

---

## 🔄 Admin Integration Tests

### Admin Portal
- [ ] `http://localhost:8080/admin/social` loads
- [ ] All channels visible
- [ ] Can create new channel
- [ ] Can delete channel
- [ ] Can approve/decline requests

### Ticket System
- [ ] Send "@admin" message from student
- [ ] Open admin portal
- [ ] Click "Show" under Support Tickets
- [ ] Ticket appears with correct info
- [ ] Can type reply
- [ ] Reply saves successfully

---

## 🐛 Console Checks

### No Errors
- [ ] No red errors in console
- [ ] No warnings about React
- [ ] No CORS errors
- [ ] No network 404s (except expected stubs)

### Expected Logs
- [ ] Socket connection logs
- [ ] API call logs (optional)
- [ ] Reconnection logs (if disconnected)

---

## 📊 Performance Checks

### Load Time
- [ ] Page loads in <2 seconds
- [ ] Lazy-loaded components show quickly
- [ ] Images load efficiently

### Memory
- [ ] No memory leaks (check after 5 minutes of use)
- [ ] Message list doesn't grow indefinitely

---

## ✅ Completion Criteria

All critical tests passing:
- [x] Page loads without errors
- [ ] Channels display correctly
- [ ] Can send/receive messages
- [ ] @admin creates tickets
- [ ] @pixi responds
- [ ] Polls work
- [ ] Images upload
- [ ] No console errors
- [ ] Responsive design works

---

## 🔍 Issues Found

Log any issues here:

1. **Issue**: 
   - **Steps to reproduce**: 
   - **Expected**: 
   - **Actual**: 
   - **Console errors**: 

2. **Issue**: 
   - **Steps to reproduce**: 
   - **Expected**: 
   - **Actual**: 
   - **Console errors**: 

---

**Test Date**: $(date)  
**Tester**:  
**Browser**:  
**Version**:  

