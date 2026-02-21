const mongoose=require('mongoose');

const todoSchema=new mongoose.Schema({
    text:{type:String,required:true},
    completed:{type:Boolean,default:false},
});

const taskSchema=new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String},
    priority:{type:String,enum:["Low","Medium","High"],default:"Medium"},
    status:{type:String,enum:["Pending","In-Progress","Completed"],default:"Pending"},
    dueDate:{type:Date,required:true},
    assignedTo:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    attachments:{type:[String],default:[]},
    todoChecklist: [todoSchema],
    progress:{type:Number,default:0},
    // New fields for additional features
    comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}],
    dependencies:[{
        taskId:{type:mongoose.Schema.Types.ObjectId,ref:'Task'},
        type:{type:String,enum:['blocks','blockedBy','relatedTo'],default:'relatedTo'}
    }],
    timeTracked:{type:Number,default:0}, // in minutes
    reminders:[{
        type:{type:String,enum:['email','ui'],default:'ui'},
        reminderDate:{type:Date},
        sent:{type:Boolean,default:false}
    }],
    isTemplate:{type:Boolean,default:false},
    templateId:{type:mongoose.Schema.Types.ObjectId,ref:'TaskTemplate'},
    viewedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    lastViewedAt:{type:Date}
},
{timestamps:true},
);

// Index for search and filters
taskSchema.index({title:'text',description:'text'});
taskSchema.index({dueDate:1});
taskSchema.index({assignedTo:1});
taskSchema.index({priority:1});
taskSchema.index({status:1});

module.exports=mongoose.model('Task',taskSchema);