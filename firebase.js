import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIOGLGv9yon0WZq65jSnbGv2bt9kKQRao",
  authDomain: "ministerio-de-midia-tenda.firebaseapp.com",
  projectId: "ministerio-de-midia-tenda",
  storageBucket: "ministerio-de-midia-tenda.firebasestorage.app",
  messagingSenderId: "719271414284",
  appId: "1:719271414284:web:aadb0698a52287a3047c29",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cria a conta de login de outra pessoa SEM deslogar quem está cadastrando:
// usa uma segunda instância do Firebase só pra isso.
// A pessoa recebe um e-mail para definir a própria senha.
export async function criarConta(email) {
  const sec =
    getApps().find((a) => a.name === "sec") ||
    initializeApp(firebaseConfig, "sec");
  const secAuth = getAuth(sec);
  const senhaTemp = crypto.randomUUID() + "Aa1!";
  const cred = await createUserWithEmailAndPassword(secAuth, email, senhaTemp);
  await sendPasswordResetEmail(secAuth, email);
  await signOut(secAuth);
  return cred.user.uid;
}

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
};
