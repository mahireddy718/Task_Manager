require("dotenv").config();
const express=require("express");
const cors=require("cors");
const path=require("path");
const connectDB=require('./config/db');

const authRoutes=require('./routes/authRoutes');
const userRoutes=require('./routes/userRoutes');
const taskRoutes=require('./routes/taskRoutes');
const reportRoutes=require('./routes/reportRoutes');
const commentRoutes=require('./routes/commentRoutes');
const activityRoutes=require('./routes/activityRoutes');
const timeTrackingRoutes=require('./routes/timeTrackingRoutes');
const templateRoutes=require('./routes/templateRoutes');
const notificationRoutes=require('./routes/notificationRoutes');

const app=express();

//middleware to handle cors
app.use(
    cors({
        origin:process.env.CLIENT_URL||"*",
        methods:["GET","POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"],
        exposedHeaders:["Content-Disposition","Content-Type"],
})
);

//Middleware
app.use(express.json());

//connect data base
connectDB();
 
//Routes

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/reports",reportRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/activities",activityRoutes);
app.use("/api/time-tracking",timeTrackingRoutes);
app.use("/api/templates",templateRoutes);
app.use("/api/notifications",notificationRoutes);

//server uploads folder
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
//start server
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})