const multer=require("multer");

//configure storage

const storage=multer.diskStorage({
    destination:(rq,file,cb)=>{
        cb(null,'uploads/');
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    },
});

//file filter - accept all image types
const fileFilter=(req,file,cb)=>{
    // Accept all image file types
    if(file.mimetype.startsWith('image/')){
        cb(null,true);
    }
    else{
        cb(new Error('Only image files are allowed'),false);
    }
};

const upload=multer({storage, fileFilter});
module.exports=upload;