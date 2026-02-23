const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

//Generate JWT token

const generateToken=(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:'7d'});
};

// Helper function to validate password
const validatePassword=(password)=>{
    const errors=[];
    if(password.length<8){
        errors.push("Password must be at least 8 characters");
    }
    if(!/[A-Z]/.test(password)){
        errors.push("Password must contain at least one uppercase letter");
    }
    if(!/[a-z]/.test(password)){
        errors.push("Password must contain at least one lowercase letter");
    }
    if(!/[0-9]/.test(password)){
        errors.push("Password must contain at least one number");
    }
    return errors;
};

//@desc Register a new user
//@route POST/api/auth/register
//@access public

const registerUser=async(req,res)=>{
    try{
        const{name,email,password,profileImageUrl,adminInviteToken}=req.body;
        
        //Validate input
        if(!name||name.trim()===''){
            return res.status(400).json({message:"Name is required"});
        }
        if(!email||email.trim()===''){
            return res.status(400).json({message:"Email is required"});
        }
        if(!password||password.trim()===''){
            return res.status(400).json({message:"Password is required"});
        }
        
        // Validate password
        const passwordErrors=validatePassword(password);
        if(passwordErrors.length>0){
            return res.status(400).json({message:"Password is invalid",errors:passwordErrors});
        }
        
        //check if user already exists
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:"Email already exists in our system"});
        }
        
        //determine user role: Admin if correct token is provided , otherwise member
        let role="member";
        if(adminInviteToken&& adminInviteToken==process.env.ADMIN_INVITE_TOKEN){
            role="admin";
        }

        //hash password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        //create new user
         const user=await User.create({
            name,
            email,
            password:hashedPassword,
            profileImageUrl,
            role,
         });
         res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
         })
    }catch(error){
        res.status(500).json({message: "Server error",error:error.message});
    }
};

//@desc login user
//@route POST/api/auth/login
//@access public

const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        
        //Validate input
        if(!email||email.trim()===''){
            return res.status(400).json({message:"Email is required"});
        }
        if(!password||password.trim()===''){
            return res.status(400).json({message:"Password is required"});
        }
        
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Email is incorrect or user does not exist"})
        }

        //compare password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message:"Password is incorrect"});
        }

        //return user data with jwt
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({message: "Server error",error:error.message})
    }
};

//desc Get user profile
//@route GeT/api/auth/profile
//@access private {Requires JWT}

const getUserProfile= async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
          res.json({
            ...user._doc,
            token: generateToken(user._id)
        });
    }catch(error){
        res.status(500).json({message: "Server error",error:error.message})
    }
};

//@desc Update user profile
//@route PUT/api/auth/profile
//@access private {Requires JWT}

const updateUserProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id);
        if(!user){
           return res.status(404).json({message:"User not found"});
        }
        user.name=req.body.name||user.name;
        user.email=req.body.email||user.email;
        if(req.body.profileImageUrl){
            user.profileImageUrl=req.body.profileImageUrl;
        }
        if(req.body.password){
            // Validate password
            const passwordErrors=validatePassword(req.body.password);
            if(passwordErrors.length>0){
                return res.status(400).json({message:"Password is invalid",errors:passwordErrors});
            }
            const salt=await bcrypt.genSalt(10);
            user.password=await bcrypt.hash(req.body.password,salt);
        }
        const updateUser=await user.save();
        res.json({
            _id:updateUser._id,
            name:updateUser.name,
            email:updateUser.email,
            role:updateUser.role,
            profileImageUrl:updateUser.profileImageUrl,
            token:generateToken(updateUser._id),
        })
    }catch(error){
        res.status(500).json({message: "Server error",error:error.message})
    }
};
module.exports={registerUser,loginUser,getUserProfile,updateUserProfile};
