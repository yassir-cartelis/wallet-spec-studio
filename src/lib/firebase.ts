import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyB5O-fO7RFqoJzspnHppRYMrjjSh_ZushE',
  authDomain: 'client-divers.firebaseapp.com',
  projectId: 'client-divers',
  storageBucket: 'client-divers.firebasestorage.app',
  messagingSenderId: '297042014454',
  appId: '1:297042014454:web:25819e458ee3b437febcd7',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
