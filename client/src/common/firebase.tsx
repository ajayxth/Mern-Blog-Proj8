// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup,getAuth } from "firebase/auth";




const firebaseConfig = {
  apiKey: "AIzaSyBedN4HtTqHmBEfc3mr9tsdU9uMV3PhVtA",
  authDomain: "mern-blog-42ba5.firebaseapp.com",
  projectId: "mern-blog-42ba5",
  storageBucket: "mern-blog-42ba5.firebasestorage.app",
  messagingSenderId: "990407536330",
  appId: "1:990407536330:web:429299d235b58514c48e33"
};


export const app = initializeApp(firebaseConfig);

// /google auth
const provider = new GoogleAuthProvider()

const auth = getAuth()

export const authWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);

  return result.user;
};