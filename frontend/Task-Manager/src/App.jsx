//new git
import React,{useContext} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard.jsx';
import Login from './pages/Auth/Login.jsx';
import SignUp from './pages/Auth/SignUp.jsx';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers.jsx';

import UserDashboard from './pages/User/UserDashboard.jsx';
import MyTasks from './pages/User/MyTasks.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';

import ViewTaskDetails from './pages/User/ViewTaskDetails.jsx'
import UserProvider,{UserContext} from './context/userContext.jsx';
import SearchProvider from './context/searchContext.jsx';
import { ThemeProvider } from './context/themeContext.jsx';
import { Toaster } from 'react-hot-toast';

// Root component to handle default route
const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/user/dashboard" replace />
  );
};

const App = () => {
  return (
    <ThemeProvider>
    <SearchProvider>
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          {/*Here let's add Admin Routes and these are protected routes 'cause it will be used by specific members*/}
          <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
            <Route path="/admin/dashboard" element={<Dashboard/>}/>
            <Route path="/admin/tasks" element={<ManageTasks/>}/>
            <Route path="/admin/create-task" element={<CreateTask/>}/>
            <Route path="/admin/users" element={<ManageUsers/>}/>
          </Route>

          {/* user routes */}
          <Route element={<PrivateRoute allowedRoles={["member"]}/>}>
            <Route path="/user/dashboard" element={<UserDashboard/>} />
            <Route path="/user/my-tasks" element={<MyTasks/>}/>
            <Route path="/user/task-details/:id" element={<ViewTaskDetails/>} />
          </Route> 
          {/* default route */}
          <Route path="/" element={<Root/>}/>
        </Routes>
      </Router>
    </div>

    <Toaster
    toastOptions={{
      className:"",
      style:{
        fontSize:"13px",
      }
    }}
    />
    </UserProvider>
    </SearchProvider>
    </ThemeProvider>
  )
}

export default App