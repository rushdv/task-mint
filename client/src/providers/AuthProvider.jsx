import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase/firebase.config'
import useAxiosPublic from '../hooks/useAxiosPublic'

export const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const axiosPublic = useAxiosPublic()

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const updateUserProfile = (name, photo) =>
    updateProfile(auth.currentUser, { displayName: name, photoURL: photo })

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const googleLogin = () => signInWithPopup(auth, googleProvider)

  const logout = () => signOut(auth)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const res = await axiosPublic.post('/jwt', { email: currentUser.email })
          localStorage.setItem('access-token', res.data.token)
        } catch {
          localStorage.removeItem('access-token')
        }
      } else {
        localStorage.removeItem('access-token')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [axiosPublic])

  return (
    <AuthContext.Provider value={{ user, loading, register, updateUserProfile, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthProvider
