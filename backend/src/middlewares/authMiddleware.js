const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { verifyToken } = require('@clerk/clerk-sdk-node');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Try local admin JWT verification first
      try {
        const decodedLocal = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedLocal.id).select('-password');
        if (req.user) {
          return next();
        }
      } catch (localErr) {
        // If local verification fails, try Clerk verification
        const clerkSession = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        
        // Find user by clerk ID
        req.user = await User.findOne({ clerkId: clerkSession.sub });
        
        if (!req.user) {
          // If this is the sync route, attach the clerk payload and pass through
          if (req.originalUrl.includes('/sync')) {
             req.clerkSession = clerkSession;
             return next();
          }
          return res.status(401).json({ message: 'User not synced with database yet.' });
        }
        return next();
      }
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
