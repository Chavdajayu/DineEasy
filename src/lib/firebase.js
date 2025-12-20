import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrUAPCerB_wRSl65cfjuU-U9cZ3WVOnXM",
  authDomain: "dineeasy-952aa.firebaseapp.com",
  projectId: "dineeasy-952aa",
  storageBucket: "dineeasy-952aa.firebasestorage.app",
  messagingSenderId: "818720615914",
  appId: "1:818720615914:web:453e9a7c51bcc9ea12d693"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
