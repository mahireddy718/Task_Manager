const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Helper to normalize task status keys
const STATUS_IN_PROGRESS = "In-Progress";

//@desc get all users (admin only)
//@ route GET/api/users
//@access Private(Admin)

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");

        //add a task counts to each user
        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: STATUS_IN_PROGRESS });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc, //includes all existing user data
                pendingTasks,
                inProgressTasks,
                completedTasks,
            };
        }));

        // Return wrapped response to match frontend expectation
        res.json({ users: usersWithTaskCounts });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//@desc GET user by ID
//@route GET/api/users/:id
//@acces private


const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({message: "User not found"});
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//@desc Create a new user (Admin only)
//@route POST /api/users
//@access Private (Admin)
const createUser = async (req, res) => {
    try {
        const { name, email, phone, address, role } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Name, email and phone are required" });
        }

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // default temporary password
        const tempPassword = "Password123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
            name,
            email,
            phone,
            address,
            role: role || 'member',
            password: hashedPassword,
        });

        res.status(201).json({ message: "User created successfully", user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, address: newUser.address, createdAt: newUser.createdAt } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Delete a user (Admin only)
//@route DELETE /api/users/:id
//@access Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.remove();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUsers, getUserById, createUser, deleteUser };