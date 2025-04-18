const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');
const mongoose = require('mongoose');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.code === 'auth/invalid-credential') {
      return res.status(401).json({ 
        message: 'Invalid authentication credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, address, gender, role } = req.body;
    
    console.log('Registration attempt for:', email);
    
    // Step 1: Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });
    console.log('Firebase user created:', userRecord.uid);

    // Step 2: Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: role || 'user'
    });
    console.log('Custom claims set for user');

    // Step 3: Create user in MongoDB
    const user = new User({
      firebaseUid: userRecord.uid,  // This links Firebase and MongoDB
      email: userRecord.email,
      name,
      phone,
      address,
      gender,
      role: role || 'user'
    });

    console.log('Creating MongoDB user with data:', {
      firebaseUid: userRecord.uid,
      email: userRecord.email,
      name,
      role: role || 'user'
    });

    const savedUser = await user.save();
    console.log('MongoDB user created successfully:', savedUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: savedUser.name,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // If Firebase user was created but MongoDB failed, clean up
    if (error.name === 'ValidationError' && req.body.email) {
      try {
        await admin.auth().deleteUser(req.body.uid);
        console.log('Cleaned up Firebase user after MongoDB failure');
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(400).json({ 
      message: error.message,
      code: error.code
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Step 1: Get user from Firebase
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Step 2: Create custom token
    const token = await admin.auth().createCustomToken(userRecord.uid);
    
    // Step 3: Get user details from MongoDB
    const user = await User.findOne({ firebaseUid: userRecord.uid });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        gender: user.gender
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      message: 'Invalid credentials',
      code: error.code
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, address, gender } = req.body;
    const { uid } = req.user;

    // Update Firebase user
    await admin.auth().updateUser(uid, {
      displayName: name
    });

    // Update MongoDB user
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        name,
        phone,
        address,
        gender,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ 
      message: error.message,
      code: error.code
    });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: user.firebaseUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      role: user.role
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      code: error.code
    });
  }
});

// Update FCM token
router.post('/fcm-token', verifyToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const { uid } = req.user;

    await User.findOneAndUpdate(
      { firebaseUid: uid },
      { fcmToken },
      { new: true }
    );

    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('FCM token update error:', error);
    res.status(500).json({ message: 'Error updating FCM token' });
  }
});

// Test route to check all users in MongoDB
router.get('/test/users', async (req, res) => {
  try {
    const users = await User.find({});
    console.log('Users in MongoDB:', users);
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Test route to check specific user by email
router.get('/test/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);
    res.json({
      message: 'User retrieved successfully',
      user: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// MongoDB Health Check
router.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState;
    const mongoStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoStatus];

    // Try to perform a simple query
    const userCount = await User.countDocuments();
    
    res.json({
      status: 'ok',
      mongoDB: {
        connection: mongoStatusText,
        userCount: userCount,
        connectionString: process.env.MONGODB_URI
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'MongoDB health check failed',
      error: error.message
    });
  }
});

// Debug route to check all data
router.get('/debug/data', async (req, res) => {
  try {
    // Get all users from MongoDB
    const users = await User.find({});
    
    // Get all Firebase users
    const firebaseUsers = await admin.auth().listUsers();
    
    res.json({
      mongoDB: {
        userCount: users.length,
        users: users
      },
      firebase: {
        userCount: firebaseUsers.users.length,
        users: firebaseUsers.users.map(user => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }))
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      message: 'Error fetching debug data',
      error: error.message 
    });
  }
});

// Debug route to check user data
router.get('/debug/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found in MongoDB' });
    }
    
    // Also check Firebase
    const firebaseUser = await admin.auth().getUserByEmail(req.params.email);
    
    res.json({
      message: 'User data found',
      mongodb: user,
      firebase: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sync Firebase users with MongoDB
router.get('/sync-users', async (req, res) => {
  try {
    console.log('Starting user sync...');
    
    // Get all Firebase users
    const firebaseUsers = await admin.auth().listUsers();
    console.log(`Found ${firebaseUsers.users.length} Firebase users`);
    
    let synced = 0;
    let errors = [];
    
    // For each Firebase user
    for (const firebaseUser of firebaseUsers.users) {
      try {
        // Check if user exists in MongoDB
        const mongoUser = await User.findOne({ firebaseUid: firebaseUser.uid });
        
        if (!mongoUser) {
          // Create MongoDB user if not exists
          const newUser = new User({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Unknown',
            role: firebaseUser.customClaims?.role || 'user'
          });
          
          await newUser.save();
          synced++;
          console.log(`Synced user: ${firebaseUser.email}`);
        }
      } catch (error) {
        errors.push({
          email: firebaseUser.email,
          error: error.message
        });
        console.error(`Error syncing user ${firebaseUser.email}:`, error);
      }
    }
    
    res.json({
      message: 'User sync completed',
      totalFirebaseUsers: firebaseUsers.users.length,
      newlySynced: synced,
      errors: errors
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 