import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqHH_ftLY2tp2kMwq3b4IJqg4yu2wDy-o",
  authDomain: "pulseup-app.firebaseapp.com",
  projectId: "pulseup-app",
  storageBucket: "pulseup-app.firebasestorage.app",
  messagingSenderId: "834268126896",
  appId: "1:834268126896:web:3685acd969e3f3878d2575",
  measurementId: "G-LR9FP3V56Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)