import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  onAuthStateChanged(auth, (u) => {
    user.value = u
    loading.value = false
  })

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function logout() {
    await signOut(auth)
  }

  return { user, loading, loginWithGoogle, logout }
})
