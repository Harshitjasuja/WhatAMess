import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful:', userCredential.user.uid);
      
      // Get the token
      const token = await userCredential.user.getIdToken();
      console.log('Got Firebase token');
      
      try {
        // Get user profile from backend
        const response = await axios.get('http://localhost:5001/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Backend profile response:', response.data);
        
        // Update currentUser with role and other user data
        const updatedUser = {
          ...userCredential.user,
          role: response.data.role,
          name: response.data.name,
          email: response.data.email,
          uid: response.data.uid
        };
        
        setCurrentUser(updatedUser);
        console.log('Updated user with role:', updatedUser.role);
        
        return userCredential;
      } catch (profileError) {
        console.error('Error getting user profile:', profileError);
        // Still return the userCredential even if profile fetch fails
        return userCredential;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 