import { createContext, useContext, useState, useEffect } from 'react';
import { auth, logOut, db } from '../services/firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.uid) {
        setCurrentUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() || {});
        } else {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'student',
            points: 0,
            level: 1,
            badges: [],
            streak: 0,
            createdAt: new Date()
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile || {});
        }
        setLoading(false); // Set loading to false after user and profile are loaded
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    setPersistence(auth, browserLocalPersistence);

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error.code, error.message);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    if (currentUser && currentUser.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, updates, { merge: true });
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
  };

  const value = {
    currentUser,
    userProfile,
    signIn,
    signOut: signOutUser,
    updateUserProfile,
    loading,
    isAdmin: userProfile?.role === 'admin',
    isStudent: userProfile?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
