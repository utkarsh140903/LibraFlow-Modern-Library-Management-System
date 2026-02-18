import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt by:", username);

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        console.log("Login successful");
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        console.log("Login failed: Invalid credentials");
        res.status(401);
        throw new Error('Invalid username or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Private/Admin
const registerUser = asyncHandler(async (req, res) => {
    const { name, username, password, role, contactNumber, address, aadharCardNo, status } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        username,
        password,
        role,
        contactNumber,
        address,
        aadharCardNo,
        status
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role,
            status: user.status,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.username = req.body.username || user.username;
        user.role = req.body.role || user.role;
        user.contactNumber = req.body.contactNumber || user.contactNumber;
        user.address = req.body.address || user.address;
        user.aadharCardNo = req.body.aadharCardNo || user.aadharCardNo;
        user.status = req.body.status || user.status;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            role: updatedUser.role,
            status: updatedUser.status,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export {
    authUser,
    registerUser,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
};
