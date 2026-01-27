import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../context/authStore'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'
import { 
  PhoneIcon, 
  EnvelopeIcon,
  LockClosedIcon, 
  UserIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'

// ============================================
// DEMO ACCOUNTS - Comment out in production
// ============================================
const DEMO_ACCOUNTS = [
  { type: 'Customer', phone: '9876543210', password: 'password123', icon: UserIcon, color: 'blue' },
  { type: 'Provider', phone: '9876543220', password: 'password123', icon: WrenchScrewdriverIcon, color: 'emerald' },
  { type: 'Admin', phone: '9876543230', password: 'password123', icon: ShieldCheckIcon, color: 'purple' },
]
// ============================================

// Login method tabs
const LOGIN_METHODS = {
  PHONE: 'phone',
  EMAIL: 'email',
  PASSWORD: 'password',
  GOOGLE: 'google',
}

export default function Login() {
  const navigate = useNavigate()
  const { login, sendOtp, verifyOtp, googleLogin, isLoading, error, clearError } = useAuthStore()
  
  // UI State
  const [activeMethod, setActiveMethod] = useState(LOGIN_METHODS.PHONE)
  const [otpSent, setOtpSent] = useState(false)
  const [otpIdentifier, setOtpIdentifier] = useState('') // phone or email that OTP was sent to
  const [countdown, setCountdown] = useState(0)
  const [loggingInAs, setLoggingInAs] = useState(null)
  const [passwordLoginType, setPasswordLoginType] = useState('phone') // 'phone' or 'email'
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm()
  
  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Reset form when switching methods
  useEffect(() => {
    setOtpSent(false)
    setOtpIdentifier('')
    clearError()
    reset()
  }, [activeMethod, clearError, reset])

  // ============================================
  // OTP Flow Handlers
  // ============================================

  const handleSendOtp = async (data) => {
    clearError()
    const identifier = activeMethod === LOGIN_METHODS.PHONE ? data.phone : data.email
    
    const result = await sendOtp(
      activeMethod === LOGIN_METHODS.PHONE ? identifier : null,
      activeMethod === LOGIN_METHODS.EMAIL ? identifier : null
    )
    
    if (result.success) {
      setOtpSent(true)
      setOtpIdentifier(identifier)
      setCountdown(60) // 60 seconds cooldown for resend
      toast.success(`OTP sent to ${activeMethod === LOGIN_METHODS.PHONE ? 'phone' : 'email'}!`)
    } else {
      toast.error(result.error)
    }
  }

  const handleVerifyOtp = async (data) => {
    clearError()
    const result = await verifyOtp(
      activeMethod === LOGIN_METHODS.PHONE ? otpIdentifier : null,
      activeMethod === LOGIN_METHODS.EMAIL ? otpIdentifier : null,
      data.otp
    )
    
    if (result.success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    clearError()
    const result = await sendOtp(
      activeMethod === LOGIN_METHODS.PHONE ? otpIdentifier : null,
      activeMethod === LOGIN_METHODS.EMAIL ? otpIdentifier : null
    )
    
    if (result.success) {
      setCountdown(60)
      toast.success('OTP resent!')
    } else {
      toast.error(result.error)
    }
  }

  const handleBackToIdentifier = () => {
    setOtpSent(false)
    setOtpIdentifier('')
    clearError()
  }

  // ============================================
  // Google OAuth Handler
  // ============================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      
      const result = await googleLogin({
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        imageUrl: decoded.picture,
      })
      
      if (result.success) {
        toast.success('Login successful!')
        navigate('/')
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Google login failed. Please try again.')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.')
  }

  // ============================================
  // Password Login Handler
  // ============================================

  const handlePasswordLogin = async (data) => {
    clearError()
    const result = await login(
      passwordLoginType === 'phone' ? data.identifier : null,
      passwordLoginType === 'email' ? data.identifier : null,
      data.password
    )
    
    if (result.success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  // ============================================
  // Demo Login Handler (Password-based)
  // ============================================

  const handleDemoLogin = async (account) => {
    clearError()
    setLoggingInAs(account.type)
    
    const result = await login(account.phone, null, account.password)
    if (result.success) {
      toast.success(`Logged in as ${account.type}!`)
      navigate('/')
    } else {
      toast.error(result.error)
    }
    setLoggingInAs(null)
  }

  // ============================================
  // Render Methods
  // ============================================

  const renderMethodTabs = () => (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
      <button
        type="button"
        onClick={() => setActiveMethod(LOGIN_METHODS.PHONE)}
        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
          activeMethod === LOGIN_METHODS.PHONE
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <PhoneIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
        Phone
      </button>
      <button
        type="button"
        onClick={() => setActiveMethod(LOGIN_METHODS.EMAIL)}
        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
          activeMethod === LOGIN_METHODS.EMAIL
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <EnvelopeIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
        Email
      </button>
      <button
        type="button"
        onClick={() => setActiveMethod(LOGIN_METHODS.PASSWORD)}
        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
          activeMethod === LOGIN_METHODS.PASSWORD
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <LockClosedIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
        Password
      </button>
      <button
        type="button"
        onClick={() => setActiveMethod(LOGIN_METHODS.GOOGLE)}
        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
          activeMethod === LOGIN_METHODS.GOOGLE
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="h-4 w-4 inline mr-1 -mt-0.5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
    </div>
  )

  const renderPhoneForm = () => (
    <form onSubmit={handleSubmit(otpSent ? handleVerifyOtp : handleSendOtp)} className="space-y-5">
      {!otpSent ? (
        // Step 1: Enter phone number
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[+]?[0-9]{10,15}$/,
                  message: 'Enter a valid phone number'
                }
              })}
              className={`input pl-12 ${errors.phone ? 'input-error' : ''}`}
              placeholder="+91 9876543210"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1.5">{errors.phone.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            We'll send a 6-digit OTP to this number
          </p>
        </div>
      ) : (
        // Step 2: Enter OTP
        <>
          <button
            type="button"
            onClick={handleBackToIdentifier}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Change phone number
          </button>
          
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-4">
            <p className="font-medium">OTP sent to {otpIdentifier}</p>
            <p className="text-blue-600 text-xs mt-1">Check your phone for the verification code</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              maxLength={6}
              {...register('otp', { 
                required: 'OTP is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Enter a valid 6-digit OTP'
                }
              })}
              className={`input text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? 'input-error' : ''}`}
              placeholder="------"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1.5">{errors.otp.message}</p>
            )}
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isLoading}
              className={`text-sm ${
                countdown > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3.5 text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {otpSent ? 'Verifying...' : 'Sending OTP...'}
          </span>
        ) : (
          otpSent ? 'Verify & Sign In' : 'Send OTP'
        )}
      </button>
    </form>
  )

  const renderEmailForm = () => (
    <form onSubmit={handleSubmit(otpSent ? handleVerifyOtp : handleSendOtp)} className="space-y-5">
      {!otpSent ? (
        // Step 1: Enter email
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Za-z0-9+_.-]+@(.+)$/,
                  message: 'Enter a valid email address'
                }
              })}
              className={`input pl-12 ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            We'll send a 6-digit OTP to this email
          </p>
        </div>
      ) : (
        // Step 2: Enter OTP
        <>
          <button
            type="button"
            onClick={handleBackToIdentifier}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Change email address
          </button>
          
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-4">
            <p className="font-medium">OTP sent to {otpIdentifier}</p>
            <p className="text-blue-600 text-xs mt-1">Check your email inbox (and spam folder)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              maxLength={6}
              {...register('otp', { 
                required: 'OTP is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Enter a valid 6-digit OTP'
                }
              })}
              className={`input text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? 'input-error' : ''}`}
              placeholder="------"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1.5">{errors.otp.message}</p>
            )}
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isLoading}
              className={`text-sm ${
                countdown > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3.5 text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {otpSent ? 'Verifying...' : 'Sending OTP...'}
          </span>
        ) : (
          otpSent ? 'Verify & Sign In' : 'Send OTP'
        )}
      </button>
    </form>
  )

  const renderGoogleLogin = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <p className="text-gray-600">Sign in with your Google account</p>
      </div>
      
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          size="large"
          width="350"
          text="signin_with"
          shape="rectangular"
          logo_alignment="left"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mt-4">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center mt-4">
          <svg className="animate-spin h-6 w-6 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  )

  const renderPasswordForm = () => (
    <form onSubmit={handleSubmit(handlePasswordLogin)} className="space-y-5">
      {/* Toggle between phone and email */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => setPasswordLoginType('phone')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            passwordLoginType === 'phone'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <PhoneIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
          Phone
        </button>
        <button
          type="button"
          onClick={() => setPasswordLoginType('email')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            passwordLoginType === 'email'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <EnvelopeIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
          Email
        </button>
      </div>

      {/* Identifier input (phone or email) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {passwordLoginType === 'phone' ? 'Phone Number' : 'Email Address'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {passwordLoginType === 'phone' ? (
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <input
            type={passwordLoginType === 'phone' ? 'tel' : 'email'}
            {...register('identifier', { 
              required: `${passwordLoginType === 'phone' ? 'Phone number' : 'Email'} is required`,
              pattern: passwordLoginType === 'phone' 
                ? {
                    value: /^[+]?[0-9]{10,15}$/,
                    message: 'Enter a valid phone number'
                  }
                : {
                    value: /^[A-Za-z0-9+_.-]+@(.+)$/,
                    message: 'Enter a valid email address'
                  }
            })}
            className={`input pl-12 ${errors.identifier ? 'input-error' : ''}`}
            placeholder={passwordLoginType === 'phone' ? '+91 9876543210' : 'you@example.com'}
          />
        </div>
        {errors.identifier && (
          <p className="text-red-500 text-sm mt-1.5">{errors.identifier.message}</p>
        )}
      </div>

      {/* Password input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            className={`input pl-12 ${errors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Don't have a password? Login with OTP first, then set a password from your profile.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3.5 text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="text-gray-500 mt-2">Sign in to continue to HireLink</p>
      </div>
      
      {renderMethodTabs()}
      
      {activeMethod === LOGIN_METHODS.PHONE && renderPhoneForm()}
      {activeMethod === LOGIN_METHODS.EMAIL && renderEmailForm()}
      {activeMethod === LOGIN_METHODS.PASSWORD && renderPasswordForm()}
      {activeMethod === LOGIN_METHODS.GOOGLE && renderGoogleLogin()}

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">New to HireLink?</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/register" className="btn-secondary w-full py-3">
            Create an Account
          </Link>
        </div>
      </div>

      {/* ============================================ */}
      {/* DEMO ACCOUNTS - Comment out in production */}
      {/* ============================================ */}
      <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Quick Demo Login (Password-based)
        </p>
        <p className="text-xs text-amber-600 mb-3">Click to auto-login as any account:</p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon
            const isLoggingIn = loggingInAs === account.type
            return (
              <button
                key={account.type}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading || loggingInAs}
                className={`
                  p-3 rounded-xl border-2 transition-all text-center
                  ${account.color === 'blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300' : ''}
                  ${account.color === 'emerald' ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300' : ''}
                  ${account.color === 'purple' ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300' : ''}
                  ${isLoggingIn ? 'ring-2 ring-offset-2 ring-amber-400' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isLoggingIn ? (
                  <svg className="animate-spin h-5 w-5 mx-auto mb-1 text-amber-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${
                    account.color === 'blue' ? 'text-blue-600' : 
                    account.color === 'emerald' ? 'text-emerald-600' : 
                    'text-purple-600'
                  }`} />
                )}
                <span className={`text-xs font-medium ${
                  account.color === 'blue' ? 'text-blue-700' : 
                  account.color === 'emerald' ? 'text-emerald-700' : 
                  'text-purple-700'
                }`}>
                  {account.type}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-amber-500 mt-3 text-center">
          Password for all: <span className="font-mono font-semibold">password123</span>
        </p>
      </div>
      {/* ============================================ */}
    </div>
  )
}
