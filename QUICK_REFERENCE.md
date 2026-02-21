# 🎯 Quick Reference Guide - Task Manager Features

## 📚 Documentation Map

| Document | Purpose | Link |
|----------|---------|------|
| **FEATURES.md** | Complete feature documentation | All feature details |
| **IMPLEMENTATION_GUIDE.md** | How to integrate features | Integration steps |
| **CHANGES_SUMMARY.md** | What was added/changed | File listing |
| **QUICK_REFERENCE.md** | This quick guide | Quick lookups |

---

## 🎨 Frontend Components Quick Guide

### 1. Theme Toggle
```jsx
import ThemeToggle from './components/Theme/ThemeToggle';
// Add to Navbar - no props needed
<ThemeToggle />
```
**Location**: `Theme` menu icon  
**Features**: Light/Dark mode toggle  
**File**: `components/Theme/ThemeToggle.jsx`

---

### 2. Notification Center
```jsx
import NotificationCenter from './components/Notifications/NotificationCenter';
// Add to Navbar
<NotificationCenter />
```
**Location**: Navbar  
**Features**: Bell icon with badge, dropdown list  
**File**: `components/Notifications/NotificationCenter.jsx`

---

### 3. Advanced Search
```jsx
import AdvancedSearch from './components/Search/AdvancedSearch';
<AdvancedSearch onResults={(tasks) => setTasks(tasks)} />
```
**Location**: Task list pages  
**Features**: Search, filter, sort options  
**File**: `components/Search/AdvancedSearch.jsx`

---

### 4. Task Comments
```jsx
import TaskComments from './components/Comments/TaskComments';
<TaskComments taskId={taskId} />
```
**Location**: Task details page  
**Features**: Add, edit, delete, like, reply  
**File**: `components/Comments/TaskComments.jsx`

---

### 5. Activity Log
```jsx
import ActivityLog from './components/ActivityLog/ActivityLog';
<ActivityLog taskId={taskId} />
```
**Location**: Task details sidebar  
**Features**: Timeline of all changes  
**File**: `components/ActivityLog/ActivityLog.jsx`

---

### 6. Time Tracking
```jsx
import TimeTracking from './components/TimeTracking/TimeTracking';
<TimeTracking taskId={taskId} />
```
**Location**: Task details page  
**Features**: Start/stop timer, manual entry  
**File**: `components/TimeTracking/TimeTracking.jsx`

---

### 7. Calendar View
```jsx
import CalendarView from './components/Calendar/CalendarView';
<CalendarView onTaskSelect={(taskId) => navigate(...)} />
```
**Location**: Dedicated calendar page  
**Features**: Visual calendar, color-coded tasks  
**File**: `components/Calendar/CalendarView.jsx`

---

### 8. Task Templates
```jsx
import TaskTemplates from './components/Templates/TaskTemplates';
<TaskTemplates />
```
**Location**: Dedicated templates page  
**Features**: Create, use, manage templates  
**File**: `components/Templates/TaskTemplates.jsx`

---

### 9. Bulk Actions
```jsx
import BulkActions from './components/BulkActions/BulkActions';
<BulkActions selectedTasks={[...]} onActionComplete={() => {}} />
```
**Location**: Task list (floating menu)  
**Features**: Update, delete, assign, export  
**File**: `components/BulkActions/BulkActions.jsx`

---

## 🔌 Backend API Quick Reference

### Comments API
```bash
POST   /api/comments/:taskId           # Create comment
GET    /api/comments/:taskId           # Get all comments
PUT    /api/comments/:commentId        # Update comment
DELETE /api/comments/:commentId        # Delete comment
PUT    /api/comments/:commentId/like   # Like/unlike
POST   /api/comments/:commentId/reply  # Add reply
```

### Activity API
```bash
GET /api/activities/task/:taskId   # Get task activities
GET /api/activities/user           # Get user activities
GET /api/activities                # Get all (admin only)
```

### Time Tracking API
```bash
POST /api/time-tracking/start              # Start timer
PUT  /api/time-tracking/:id/stop           # Stop timer
PUT  /api/time-tracking/:id/pause          # Pause timer
PUT  /api/time-tracking/:id/resume         # Resume timer
POST /api/time-tracking/manual             # Manual entry
GET  /api/time-tracking/task/:taskId       # Task time logs
GET  /api/time-tracking/user               # User time logs
```

### Templates API
```bash
POST /api/templates                        # Create template
GET  /api/templates                        # Get templates
GET  /api/templates/:templateId            # Get one template
PUT  /api/templates/:templateId            # Update template
DELETE /api/templates/:templateId          # Delete template
POST /api/templates/:templateId/create-task # Create from template
```

### Notifications API
```bash
GET /api/notifications                     # Get notifications
PUT /api/notifications/:id/read            # Mark as read
PUT /api/notifications/mark-all-read       # Mark all as read
DELETE /api/notifications/:id              # Delete notification
DELETE /api/notifications/clear-all        # Clear all
GET /api/notifications/preferences         # Get preferences
PUT /api/notifications/preferences         # Update preferences
```

### Enhanced Tasks API
```bash
GET  /api/tasks/search                # Advanced search
GET  /api/tasks/calendar              # Calendar data
GET  /api/tasks/overdue               # Overdue tasks
PUT  /api/tasks/:id/view              # Mark viewed
PUT  /api/tasks/:id/dependencies      # Add dependency
DELETE /api/tasks/:id/dependencies/:id # Remove dependency
PUT  /api/tasks/bulk/update           # Bulk update
DELETE /api/tasks/bulk/delete         # Bulk delete
PUT  /api/tasks/bulk/assign           # Bulk assign
POST /api/tasks/export/csv            # Export CSV
POST /api/tasks/import/csv            # Import CSV
```

---

## 🗂️ File Structure

### New Backend Files (16 files)
```
backend/
├── models/
│   ├── Comment.js
│   ├── ActivityLog.js
│   ├── TaskTemplate.js
│   ├── TimeTracking.js
│   └── Notification.js
├── controllers/
│   ├── commentController.js
│   ├── activityController.js
│   ├── templateController.js
│   ├── timeTrackingController.js
│   └── notificationController.js
└── routes/
    ├── commentRoutes.js
    ├── activityRoutes.js
    ├── templateRoutes.js
    ├── timeTrackingRoutes.js
    └── notificationRoutes.js
```

### New Frontend Files (11 files)
```
frontend/Task-Manager/src/
├── context/
│   └── themeContext.jsx
└── components/
    ├── Comments/
    │   └── TaskComments.jsx
    ├── Calendar/
    │   └── CalendarView.jsx
    ├── TimeTracking/
    │   └── TimeTracking.jsx
    ├── Notifications/
    │   └── NotificationCenter.jsx
    ├── ActivityLog/
    │   └── ActivityLog.jsx
    ├── Search/
    │   └── AdvancedSearch.jsx
    ├── BulkActions/
    │   └── BulkActions.jsx
    ├── Templates/
    │   └── TaskTemplates.jsx
    └── Theme/
        └── ThemeToggle.jsx
```

---

## 🚀 Quick Start Integration

### Step 1: Backend
```bash
# All files are created - no installation needed
# Just copy files to your backend directory
```

### Step 2: Frontend
```bash
# All components use existing dependencies
# Just copy components to your project
```

### Step 3: Register Routes
```javascript
// In App.jsx - already updated
<ThemeProvider>
  <UserProvider>
    {/* Your routes */}
  </UserProvider>
</ThemeProvider>
```

### Step 4: Add Components to Pages
```jsx
// Add to your pages as shown in component guide above
```

### Step 5: Test
```bash
# Test each API endpoint
# Test each component
# Test dark mode
```

---

## 💾 Data Models

### Comment Schema
```javascript
{
  taskId: ObjectId,
  author: ObjectId,
  content: String,
  mentions: [ObjectId],
  attachments: [String],
  likes: [ObjectId],
  replies: [{author, content, createdAt}],
  edited: Boolean,
  editedAt: Date
}
```

### ActivityLog Schema
```javascript
{
  taskId: ObjectId,
  userId: ObjectId,
  action: String, // created, updated, deleted, etc.
  description: String,
  changes: {fieldName, oldValue, newValue},
  ipAddress: String,
  userAgent: String
}
```

### TimeTracking Schema
```javascript
{
  taskId: ObjectId,
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number, // minutes
  description: String,
  category: String, // Development, Testing, etc.
  isRunning: Boolean,
  billable: Boolean
}
```

### TaskTemplate Schema
```javascript
{
  name: String,
  description: String,
  category: String,
  defaultPriority: String,
  defaultDueDays: Number,
  todoChecklist: Array,
  tags: [String],
  createdBy: ObjectId,
  isPublic: Boolean,
  usageCount: Number,
  attachmentTemplate: [String]
}
```

### Notification Schema
```javascript
{
  userId: ObjectId,
  taskId: ObjectId,
  title: String,
  message: String,
  type: String, // task_assigned, task_overdue, etc.
  read: Boolean,
  readAt: Date,
  actionUrl: String,
  priority: String,
  sendEmail: Boolean,
  emailSent: Boolean
}
```

---

## 🔒 Permission Types

```javascript
// Available permissions
permissions: [
  {
    resource: 'tasks',        // or 'comments', 'templates', 'reports', 'users'
    actions: [
      'create',               // Can create
      'read',                 // Can view
      'update',               // Can modify
      'delete'                // Can remove
    ]
  }
]
```

---

## 🎨 Theme Classes

### Dark Mode Support
```css
/* Automatically handled by Tailwind */
.dark:bg-gray-800 /* Dark background */
.dark:text-white /* Dark text */
.dark:border-gray-600 /* Dark borders */
```

---

## 📊 Common Use Cases

### Enable Commenting on Tasks
```jsx
<TaskComments taskId={taskId} />
```
✅ Done - Comments work automatically

### Track Time on Tasks
```jsx
<TimeTracking taskId={taskId} />
```
✅ Done - Start/stop timer functionality included

### See Task History
```jsx
<ActivityLog taskId={taskId} />
```
✅ Done - All changes tracked automatically

### Search Tasks
```jsx
<AdvancedSearch onResults={handleResults} />
```
✅ Done - Full search and filter

### Create Task Templates
```jsx
<TaskTemplates />
```
✅ Done - Full template management

### Bulk Update Tasks
```jsx
<BulkActions selectedTasks={ids} onActionComplete={refresh} />
```
✅ Done - Select and bulk update

### View Calendar
```jsx
<CalendarView onTaskSelect={goto} />
```
✅ Done - Visual calendar display

### Get Notifications
```jsx
<NotificationCenter />
```
✅ Done - Real-time notifications

### Switch Themes
```jsx
<ThemeToggle />
```
✅ Done - Dark/light mode toggle

---

## 🧪 Testing Quick Commands

### Test Search API
```bash
curl -X GET "http://localhost:5000/api/tasks/search?q=bug&priority=High" \
  -H "Authorization: Bearer TOKEN"
```

### Test Comments API
```bash
curl -X POST "http://localhost:5000/api/comments/TASK_ID" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content":"Great work!"}'
```

### Test Time Tracking API
```bash
curl -X POST "http://localhost:5000/api/time-tracking/start" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"taskId":"TASK_ID"}'
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dark mode not working | Check `tailwind.config.js` has `darkMode: 'class'` |
| Notifications not showing | Check backend is running, verify task ID |
| Components not importing | Check relative import paths |
| API 404 errors | Verify routes are registered in `server.js` |
| Comments not loading | Check MongoDB connection, verify indexes |
| Time tracking not saving | Verify user authentication, check MongoDB |

---

## 📈 Performance Tips

1. ✅ Use pagination for large datasets
2. ✅ Lazy load components from pages
3. ✅ Cache notifications (30 sec refresh)
4. ✅ Add database indexes (included)
5. ✅ Optimize image sizes

---

## 🎯 Next Steps

1. Read **FEATURES.md** - Understand features
2. Follow **IMPLEMENTATION_GUIDE.md** - Integrate into app
3. Use **QUICK_REFERENCE.md** - For quick lookups
4. Check **CHANGES_SUMMARY.md** - For what changed

---

**Version**: 2.0  
**Last Updated**: February 20, 2026  
**Status**: ✅ Complete
