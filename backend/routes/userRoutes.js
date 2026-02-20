const express=require("express");
const {adminOnly,protect}=require("../middlewares/authMiddleware");
const { getUsers, getUserById, createUser, deleteUser } = require("../controllers/userController");

const router=express.Router();

//user Management routes
router.get('/',protect,adminOnly,getUsers); //get all users (admin only)
router.post('/', protect, adminOnly, createUser); // create user (admin only)
router.get('/:id',protect,getUserById);//get specific user
router.delete('/:id',protect,adminOnly,deleteUser); // delete user (Admin only)

module.exports=router;
