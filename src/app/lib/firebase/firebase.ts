// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFunctions, Functions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9o3YZoU6RlJrUq_vUgxflQPUnwlpH8E8",
  authDomain: "embedding-countries.firebaseapp.com",
  projectId: "embedding-countries",
  storageBucket: "embedding-countries.appspot.com",
  messagingSenderId: "636331184161",
  appId: "1:636331184161:web:6245c8aef551b805b65360",
  measurementId: "G-9CH0YZ4XHN"
};

// Initialize Firebase
const initAnalytics = async () => {
  if (await isSupported()) {
    getAnalytics();
  }
}
if (!getApps().length) {
  initializeApp(firebaseConfig);
  initAnalytics();
}

export const functions: Functions = getFunctions();
