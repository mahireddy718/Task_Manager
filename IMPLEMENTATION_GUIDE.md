# 📋 Task Manager - Implementation Guide

This guide explains how to integrate all the new features into your Task Manager application.

---

## 🗂️ Project Structure Overview

```
Task_Manager-main/
├── backend/
│   ├── models/
│   │   ├── Task.js (UPDATED)
│   │   ├── User.js (UPDATED)
│   │   ├── Comment.js (NEW)
│   │   ├── ActivityLog.js (NEW)
│   │   ├── TaskTemplate.js (NEW)
│   │   ├── TimeTracking.js (NEW)
│   │   └── Notification.js (NEW)
│   ├── controllers/
│   │   ├── taskController.js (UPDATED with new methods)
│   │   ├── commentController.js (NEW)
│   │   ├── activityController.js (NEW)
│   │   ├── templateController.js (NEW)
│   │   ├── timeTrackingController.js (NEW)
│   │   └── notificationController.js (NEW)
│   ├── routes/
│   │   ├── taskRoutes.js (UPDATED)
│   │   ├── commentRoutes.js (NEW)
│   │   ├── activityRoutes.js (NEW)
│   │   ├── templateRoutes.js (NEW)
│   │   ├── timeTrackingRoutes.js (NEW)
│   │   └── notificationRoutes.js (NEW)
│   └── server.js (UPDATED with new routes)
├── frontend/Task-Manager/src/
│   ├── context/
│   │   ├── userContext.jsx (existing)
│   │   └── themeContext.jsx (NEW)
│   ├── components/
│   │   ├── Comments/
│   │   │   └── TaskComments.jsx (NEW)
│   │   ├── Calendar/
│   │   │   └── CalendarView.jsx (NEW)
│   │   ├── TimeTracking/
│   │   │   └── TimeTracking.jsx (NEW)
│   │   ├── Notifications/
│   │   │   └── NotificationCenter.jsx (NEW)
│   │   ├── ActivityLog/
│   │   │   └── ActivityLog.jsx (NEW)
│   │   ├── Search/
│   │   │   └── AdvancedSearch.jsx (NEW)
│   │   ├── BulkActions/
│   │   │   └── BulkActions.jsx (NEW)
│   │   ├── Templates/
│   │   │   └── TaskTemplates.jsx (NEW)
│   │   └── Theme/
│   │       └── ThemeToggle.jsx (NEW)
│   ├── App.jsx (UPDATED with ThemeProvider)
│   └── pages/ (where you'll integrate components)
└── FEATURES.md (NEW - Feature documentation)
```

---

## 🔧 Backend Setup

### 1. Database Models
All models have been created and include:
- Proper schema definitions
- Relationships and references
- Indexes for performance
- Timestamps

**No action needed** - Models are ready to use.

### 2. Controllers
All controllers are implemented with:
- Full CRUD operations
- Error handling
- Validation
- Activity logging integration

**Action**: Import controllers in route files (already done in new routes).

### 3. Routes
All routes are set up and registered in `server.js`.

**Action**: Verify all routes are accessible by testing with Postman/curl.

### 4. Middleware
Existing auth middleware supports new features:
- `protect` - Verifies user is authenticated
- `adminOnly` - Verifies user is admin

**No changes needed** unless you want custom permission checks.

---

## 🎨 Frontend Setup

### Phase 1: Theme Setup (Required First)

1. **Update App.jsx** - Already done ✅
   - Added `ThemeProvider` wrapper
   - Wraps entire app for dark mode support

2. **Update Tailwind Config** (if not already set)
   ```javascript
   // tailwind.config.js
   module.exports = {
     darkMode: 'class', // Enable dark mode
     // ... rest of config
   }
   ```

3. **Add to Navbar**
   ```jsx
   import ThemeToggle from './components/Theme/ThemeToggle';
   
   // In your Navbar component:
   <ThemeToggle />
   ```

### Phase 2: Integrate NotificationCenter

1. **Add to Navbar/Header**
   ```jsx
   import NotificationCenter from './components/Notifications/NotificationCenter';
   
   // In your Navbar:
   <NotificationCenter />
   ```

2. **Features Unlocked**:
   - Real-time notifications
   - Mark as read
   - Clear notifications
   - Notification preferences

### Phase 3: Enhance Task Details Page

Update [ViewTaskDetails.jsx](ViewTaskDetails.jsx) to include:

```jsx
import TaskComments from '../components/Comments/TaskComments';
import ActivityLog from '../components/ActivityLog/ActivityLog';
import TimeTracking from '../components/TimeTracking/TimeTracking';

// Inside your task details component:
<div className="grid grid-cols-3 gap-4">
  {/* Main task info */}
  <div className="col-span-2">
    {/* existing task details */}
    <TaskComments taskId={taskId} />
    <TimeTracking taskId={taskId} />
  </div>
  
  {/* Sidebar */}
  <div>
    <ActivityLog taskId={taskId} />
  </div>
</div>
```

### Phase 4: Add Search & Filters

Update [MyTasks.jsx](MyTasks.jsx) or [ManageTasks.jsx](ManageTasks.jsx):

```jsx
import AdvancedSearch from '../components/Search/AdvancedSearch';
import BulkActions from '../components/BulkActions/BulkActions';
import { useState } from 'react';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  return (
    <div className="space-y-4">
      <AdvancedSearch onResults={setTasks} />
      
      {/* Task list with checkboxes */}
      <div>
        {tasks.map(task => (
          <div key={task._id}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTasks([...selectedTasks, task._id]);
                } else {
                  setSelectedTasks(selectedTasks.filter(id => id !== task._id));
                }
              }}
            />
            {/* Task display */}
          </div>
        ))}
      </div>
      
      <BulkActions 
        selectedTasks={selectedTasks}
        onActionComplete={() => setSelectedTasks([])}
      />
    </div>
  );
}
```

### Phase 5: Add Calendar View

Create new page [Calendar.jsx](Calendar.jsx):

```jsx
import CalendarView from '../components/Calendar/CalendarView';
import { useNavigate } from 'react-router-dom';

export default function CalendarPage() {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Task Calendar</h1>
      <CalendarView onTaskSelect={(taskId) => {
        navigate(`/user/task-details/${taskId}`);
      }} />
    </div>
  );
}
```

### Phase 6: Add Templates Management

Create new page [Templates.jsx](Templates.jsx):

```jsx
import TaskTemplates from '../components/Templates/TaskTemplates';

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <TaskTemplates />
    </div>
  );
}
```

---

## 📱 Component Integration Checklist

### Core Components to Add

- [ ] **ThemeToggle** - Add to Navbar
- [ ] **NotificationCenter** - Add to Navbar
- [ ] **AdvancedSearch** - Add to task list pages
- [ ] **BulkActions** - Add to task list pages
- [ ] **TaskComments** - Add to task details
- [ ] **ActivityLog** - Add to task details sidebar
- [ ] **TimeTracking** - Add to task details
- [ ] **CalendarView** - Create calendar page
- [ ] **TaskTemplates** - Create templates page

### Routes to Add

```jsx
// In App.jsx, add these routes:

// For members
<Route element={<PrivateRoute allowedRoles={["member"]}/>}>
  <Route path="/user/calendar" element={<CalendarPage/>} />
  <Route path="/user/templates" element={<TemplatesPage/>} />
</Route>

// For admins
<Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
  <Route path="/admin/calendar" element={<CalendarPage/>} />
  <Route path="/admin/templates" element={<TemplatesPage/>} />
</Route>
```

---

## 🧠 How to Use Each Feature

### Search & Filter
```javascript
// The AdvancedSearch component handles everything
<AdvancedSearch onResults={(tasks) => {
  // Handle results
}} />
```

### Comments
```javascript
// Add to task details page
<TaskComments taskId={taskId} />
// Automatically handles all CRUD operations
```

### Time Tracking
```javascript
// Add to task details page
<TimeTracking taskId={taskId} />
// Provides start/stop timer and manual entry
```

### Notifications
```javascript
// Add to navbar - it fetches automatically
<NotificationCenter />
```

### Templates
```javascript
// Full template management UI
<TaskTemplates />
```

### Bulk Actions
```javascript
// Pass selected task IDs
<BulkActions selectedTasks={selectedIds} />
```

---

## 🔌 API Integration

All components use `axiosInstance` from `utils/axiosInstance.js`.

**No additional setup needed** - Just ensure your axiosInstance is configured correctly:

```javascript
// utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
```

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Dark Mode Classes Not Working
**Solution**: Ensure `tailwind.config.js` has:
```javascript
darkMode: 'class'
```

### Issue 2: Components Not Importing Correctly
**Solution**: Verify import paths match your file structure. All components use:
```javascript
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
```

### Issue 3: API Routes Returning 404
**Solution**: Verify all routes are registered in `server.js` and restart backend.

### Issue 4: Notifications Not Updating
**Solution**: Notifications component auto-refreshes every 30 seconds. Ensure backend is responding.

### Issue 5: Comments/Activity Not Showing
**Solution**: 
- Verify indexes in MongoDB
- Check that task ID is correct
- Ensure user is authenticated

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Test all new API endpoints with Postman
- [ ] Verify database models are created correctly
- [ ] Test auth middleware with new routes
- [ ] Test error handling
- [ ] Verify activity logging works

### Frontend Testing
- [ ] Test theme toggle functionality
- [ ] Test search and filters
- [ ] Test comment creation/editing/deletion
- [ ] Test time tracking start/stop
- [ ] Test notifications display
- [ ] Test bulk actions
- [ ] Test template creation and usage
- [ ] Test calendar navigation
- [ ] Test on mobile devices (responsive)

---

## 📊 Performance Considerations

1. **Database Indexes** - All models include indexes for frequently queried fields
2. **Pagination** - Activity logs, comments use pagination for performance
3. **Lazy Loading** - Components load data on mount
4. **Caching** - Consider adding Redis for notifications
5. **Notification Refresh** - Currently every 30 seconds (adjustable)

---

## 🔐 Security Notes

1. **Authentication** - All routes are protected with `protect` middleware
2. **Authorization** - Admin-only routes use `adminOnly` middleware
3. **Data Validation** - All controllers validate input
4. **CORS** - Already configured in `server.js`
5. **Activity Tracking** - All user actions are logged

---

## 📈 Scaling Recommendations

1. **WebSockets** - Use Socket.io for real-time notifications
2. **Message Queue** - Use Bull/Redis for email notifications
3. **Caching** - Redis for frequently accessed data
4. **CDN** - For static assets and uploaded files
5. **Database** - Consider sharding for large scale

---

## 🎯 Next Steps

1. Copy all files from provided structure
2. Run database migrations (if any)
3. Test backend API endpoints
4. Integrate components in frontend
5. Test all features end-to-end
6. Deploy to production

---

## 📞 Support

If you encounter any issues:
1. Check the FEATURES.md for feature details
2. Review error messages in browser console
3. Check backend logs
4. Verify database connections
5. Ensure all dependencies are installed

---

**Last Updated**: February 20, 2026  
**Version**: 2.0 (Enhanced)  
**Status**: ✅ Ready for Integration
