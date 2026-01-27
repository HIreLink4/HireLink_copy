import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login with phone/email and password
       * @param {string|null} phone - Phone number (optional)
       * @param {string|null} email - Email (optional)
       * @param {string} password - Password
       */
      login: async (phone, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = phone ? { phone, password } : { email, password }
          const response = await authAPI.login(data)
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.register(userData)
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => {
        set({ error: null })
      },

      // ============================================
      // OTP Authentication
      // ============================================

      /**
       * Send OTP to phone or email
       * @param {string|null} phone - Phone number (for SMS OTP)
       * @param {string|null} email - Email address (for Email OTP)
       */
      sendOtp: async (phone, email) => {
        set({ isLoading: true, error: null })
        try {
          const data = phone ? { phone } : { email }
          await authAPI.sendOtp(data)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to send OTP'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      /**
       * Verify OTP and login
       * @param {string|null} phone - Phone number used for OTP
       * @param {string|null} email - Email used for OTP
       * @param {string} otp - The 6-digit OTP code
       * @param {string|null} name - Optional name for new users
       * @param {string|null} userType - Optional user type (CUSTOMER/PROVIDER)
       */
      verifyOtp: async (phone, email, otp, name = null, userType = null) => {
        set({ isLoading: true, error: null })
        try {
          const data = phone 
            ? { phone, otp, name, userType } 
            : { email, otp, name, userType }
          
          const response = await authAPI.verifyOtp(data)
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Invalid OTP'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      // ============================================
      // Google OAuth Authentication
      // ============================================

      /**
       * Login with Google OAuth
       * @param {object} googleData - Google user data from OAuth response
       */
      googleLogin: async (googleData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.googleLogin(googleData)
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Google login failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      // ============================================
      // Password Management
      // ============================================

      /**
       * Set password for verified users
       * @param {string} password - New password
       */
      setPassword: async (password) => {
        set({ isLoading: true, error: null })
        try {
          await authAPI.setPassword({ password })
          // Update user to reflect they now have a password
          const currentUser = get().user
          if (currentUser) {
            set({ 
              user: { ...currentUser, hasPassword: true },
              isLoading: false 
            })
          } else {
            set({ isLoading: false })
          }
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to set password'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
