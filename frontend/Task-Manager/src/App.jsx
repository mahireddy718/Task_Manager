import React,{useContext} from 'react'
import { BrowserRouter as Router, Routes, Route,Outlet,Navigate} from 'react-router-dom';
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
import { Toaster } from 'react-hot-toast';
const App = () => {
  return (
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
          <Route element={<PrivateRoute allowedRoles={["user"]}/>}>
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
  )
}

export default App

const Root=()=>{
  const {user,loading}=useContext(UserContext);

  if(loading){
    return <Outlet/>
  }
  if(!user){
    return <Navigate to="/login"/>
  }
  return user.role==="admin"? <Navigate to="/admin/dashboard"/> : <Navigate to="/user/dashboard"/>;
}