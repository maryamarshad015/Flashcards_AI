// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsl8KhOXJIesK7Nir5-PQK5Hug1B-YRXw",
  authDomain: "flashcardsai-4f2db.firebaseapp.com",
  projectId: "flashcardsai-4f2db",
  storageBucket: "flashcardsai-4f2db.appspot.com",
  messagingSenderId: "187668108947",
  appId: "1:187668108947:web:b89dac887d566b97bf9f66",
  measurementId: "G-P5GFZR2ZLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export {db}