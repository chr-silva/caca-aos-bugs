import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, 
    doc, setDoc, updateDoc, onSnapshot, getDoc, deleteField, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfTFOnMup6D1sL4c1yXEUBuSsUePoOBno",
    authDomain: "bug-chase.firebaseapp.com",
    projectId: "bug-chase",
    storageBucket: "bug-chase.firebasestorage.app",
    messagingSenderId: "198111481315",
    appId: "1:198111481315:web:29a28e3e3e781a67dda4d6",
    measurementId: "G-3C2BHM23WD"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Torna o banco de dados e as funções do Firestore globais
// Assim o leaderboard.js e outros conseguem acessar sem dar erro de "undefined"
window.db = db;
window.firestore = { collection, addDoc, query, orderBy, limit, getDocs, 
    doc, setDoc, updateDoc, onSnapshot, getDoc, deleteField, increment};

console.log("Firebase e Firestore inicializados com sucesso!");