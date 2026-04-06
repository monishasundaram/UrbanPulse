import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlfddzDbH9KBWVsXFZWfChBwz2Lf8hy-M",
  authDomain: "urbanpulse-8c8cb.firebaseapp.com",
  projectId: "urbanpulse-8c8cb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);