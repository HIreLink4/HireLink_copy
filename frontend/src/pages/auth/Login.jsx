import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, PhoneIcon, LockClosedIcon, UserIcon, WrenchScrewdriverIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// ============================================
// DEMO ACCOUNTS - Comment out in production
// ============================================
const DEMO_ACCOUNTS = [
  { type: 'Customer', phone: '9876543210', password: 'password123', icon: UserIcon, color: 'blue' },
  { type: 'Provider', phone: '9876543220', password: 'password123', icon: WrenchScrewdriverIcon, color: 'emerald' },
  { type: 'Admin', phone: '9876543230', password: 'password123', icon: ShieldCheckIcon, color: 'purple' },
]
// ============================================

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loggingInAs, setLoggingInAs] = useState(null)
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    clearError()
    const result = await login(data.phone, data.password)
    
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/')
    } else {
      toast.error(result.error)
    }
    setLoggingInAs(null)
  }

  // Demo login handler - auto-fills and submits
  const handleDemoLogin = async (account) => {
    clearError()
    setLoggingInAs(account.type)
    setValue('phone', account.phone)
    setValue('password', account.password)
    
    // Small delay to show the auto-fill, then login
    setTimeout(async () => {
      const result = await login(account.phone, account.password)
      if (result.success) {
        toast.success(`Logged in as ${account.type}!`)
        navigate('/')
      } else {
        toast.error(result.error)
      }
      setLoggingInAs(null)
    }, 300)
  }

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="text-gray-500 mt-2">Sign in to continue to HireLink</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className={`input pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </a>
        </div>

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
          Quick Demo Login
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
