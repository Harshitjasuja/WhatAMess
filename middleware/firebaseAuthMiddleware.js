// firebaseAuthMiddleware.js
const { admin } = require('../firebase');

const firebaseProtect = async (req, res, next) => {
  try {
    // Get the ID token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add the user info to the request
    req.user = {
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number
    };
    
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = firebaseProtect;