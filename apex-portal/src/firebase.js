import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzRmI6gMAPPv_OmK9bSK9SE3KV5LpfAzU",
  authDomain: "apex-portal-6f65b.firebaseapp.com",
  projectId: "apex-portal-6f65b",
  storageBucket: "apex-portal-6f65b.firebasestorage.app",
  messagingSenderId: "592734054478",
  appId: "1:592734054478:web:1613048b06df673eafbb1f",
  measurementId: "G-6W4THZ3P6Q"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);