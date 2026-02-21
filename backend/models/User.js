const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profileImageUrl:{type:String,default:null},
    role:{type:String,enum:['admin','member'],default:'member'},//role based
    // Fine-grained permissions
    permissions:[{
        resource:{type:String,enum:['tasks','comments','templates','reports','users']},
        actions:[{type:String,enum:['create','read','update','delete']}]
    }],
    // Theme preferences
    theme:{type:String,enum:['light','dark'],default:'light'},
    // Dashboard customization
    dashboardWidgets:[{
        widgetId:{type:String},
        position:{type:Number},
        isVisible:{type:Boolean,default:true}
    }],
    // Notification preferences
    notificationPreferences:{
        emailNotifications:{type:Boolean,default:true},
        taskReminders:{type:Boolean,default:true},
        commentNotifications:{type:Boolean,default:true},
        assignmentNotifications:{type:Boolean,default:true}
    }
},
{timestamps:true}
);
module.exports=mongoose.model("User",UserSchema);