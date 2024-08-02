import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEUlKDyEMYD8hdKaanaIxsrwr7hRo1FnQ",
  authDomain: "datadigitizer-6db81.firebaseapp.com",
  projectId: "datadigitizer-6db81",
  storageBucket: "datadigitizer-6db81.appspot.com",
  messagingSenderId: "626422196571",
  appId: "1:626422196571:web:074a9698abdf3be7fa127e",
  measurementId: "G-YV90YD13DN"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { auth };