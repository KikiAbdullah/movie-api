import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get, set, remove, push } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3590hezBph5-cicvLBBNWwgK6aouZ17I",
  authDomain: "movie-api-eedc1.firebaseapp.com",
  projectId: "movie-api-eedc1",
  storageBucket: "movie-api-eedc1.firebasestorage.app",
  messagingSenderId: "1097066443662",
  appId: "1:1097066443662:web:838cc7796547ff7cf42adf",
  measurementId: "G-Y7EQ9DY37E",
  databaseURL: "https://movie-api-eedc1-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set, remove, push };
