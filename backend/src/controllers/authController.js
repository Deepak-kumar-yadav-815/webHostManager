const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth admin & get token (Singleton Admin)
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.role === 'Admin' && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync Clerk user with DB
// @route   POST /api/auth/sync
// @access  Private (Clerk Token via protect middleware)
const syncUser = async (req, res) => {
  try {
    // If the user was already found and attached by protect middleware, return it
    if (req.user) {
      return res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        clerkId: req.user.clerkId
      });
    }

    // Otherwise, we are dealing with a new user that needs to be upserted
    const { clerkSession } = req;
    const { email, name, avatar } = req.body; // Passed from frontend upon first login

    if (!clerkSession) {
      return res.status(401).json({ message: 'No clerk session provided' });
    }

    const clerkId = clerkSession.sub;
    
    // Check if a user with this email already exists (e.g., from old Google OAuth)
    let user = await User.findOne({ email });
    
    if (user) {
      // Link the existing account to Clerk
      user.clerkId = clerkId;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create a brand new user
      user = await User.create({
        name: name || 'New User',
        email,
        clerkId,
        avatar: avatar || 'https://via.placeholder.com/150'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      clerkId: user.clerkId
    });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        clerkId: user.clerkId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminLogin,
  syncUser,
  getUserProfile,
};
