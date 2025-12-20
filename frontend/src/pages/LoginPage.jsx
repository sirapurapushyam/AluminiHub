import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useGoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, GraduationCapIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { authService } from '../services/auth'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [collegeCode, setCollegeCode] = useState('')
  const [collegeCodeStatus, setCollegeCodeStatus] = useState('')
  const [collegeCodeForGoogle, setCollegeCodeForGoogle] = useState('')
  const [showGoogleCollegeModal, setShowGoogleCollegeModal] = useState(false)
  const [formError, setFormError] = useState('') // ADD THIS LINE

  // Real-time college code validation
  React.useEffect(() => {
    if (collegeCode) {
      let active = true;
      if (collegeCode.length < 6 && collegeCode.length >= 3) {
        import('../services/api').then(({ default: api }) => {
          api.get(`/auth/college-codes/search?prefix=${collegeCode}`)
            .then(res => {
              if (!active) return;
              const data = res.data;
              if (data.codes && data.codes.length > 0) {
                setCollegeCodeStatus('valid');
              } else {
                setCollegeCodeStatus('invalid');
              }
            })
            .catch(() => {
              if (!active) return;
              setCollegeCodeStatus('invalid');
            });
        });
      } else if (collegeCode.length >= 6) {
        import('../services/auth').then(({ authService }) => {
          authService.verifyCollegeCode(collegeCode)
            .then(res => {
              if (!active) return;
              setCollegeCodeStatus(res.success ? 'available' : 'not-available');
            })
            .catch(() => {
              if (!active) return;
              setCollegeCodeStatus('not-available');
            });
        });
      } else {
        setCollegeCodeStatus('');
      }
      return () => { active = false; };
    } else {
      setCollegeCodeStatus('');
    }
  }, [collegeCode]);

  const navigate = useNavigate()
  let login
  try {
    ({ login } = useAuth())
  } catch (error) {
    console.error('AuthContext error:', error)
    toast.error('Internal authentication error. Please refresh and try again.')
    return <div>Authentication provider error</div>
  }

  const { register, handleSubmit, formState: { errors } } = useForm()

  // UPDATED onSubmit function
  const onSubmit = async (data) => {
    setIsLoading(true)
    setFormError('') // Clear previous errors
    
    try {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required.')
      }
      
      // Add collegeCode if it exists
      if (collegeCode) {
        data.collegeCode = collegeCode;
      }
      
      const response = await login(data)
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      // Handle different error scenarios
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        // Verify college code
        if (!collegeCodeForGoogle) {
          toast.error('College code is required for Google login.')
          return
        }
        const verifyResponse = await authService.googleVerifyCollege(collegeCodeForGoogle)
        if (verifyResponse.success) {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          const userInfo = await userInfoResponse.json()
          // Complete registration/login
          const completeResponse = await authService.googleComplete({
            googleId: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            profileImage: userInfo.picture,
            tempToken: verifyResponse.tempToken
          })
          if (completeResponse.success) {
            toast.success('Login successful!')
            navigate('/dashboard')
          } else {
            navigate('/register', {
              state: {
                googleData: userInfo,
                collegeCode: collegeCodeForGoogle,
                tempToken: verifyResponse.tempToken
              }
            })
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Google login failed')
        console.error('Google login error:', error)
      } finally {
        setIsLoading(false)
        setShowGoogleCollegeModal(false)
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Google login failed')
      setShowGoogleCollegeModal(false)
      console.error('Google login error:', error)
    }
  })

  const initiateGoogleLogin = () => {
    setShowGoogleCollegeModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                <GraduationCapIcon className="w-6 h-6" />
              </motion.div>
            <span className="text-2xl font-bold text-gray-900">AlumConnect</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {/* ADD ERROR DISPLAY HERE */}
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{formError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label className="label">Email address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>
            {/* <div>
              <label className="label">College Code</label>
              <input
                type="text"
                value={collegeCode}
                onChange={e => setCollegeCode(e.target.value.toUpperCase())}
                className="input text-center text-1xl font-mono tracking-wider"
                placeholder="Enter your college code"
              />
              {collegeCode && collegeCode.length < 6 && collegeCode.length >= 3 && collegeCodeStatus === 'invalid' && (
                <p className="text-red-600 text-sm mt-2 text-center">Invalid college code</p>
              )}
              {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'available' && (
                <p className="text-green-600 text-sm mt-2 text-center">College code is valid</p>
              )}
              {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'not-available' && (
                <p className="text-red-600 text-sm mt-2 text-center">College code not found</p>
              )}
            </div> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                Forgot password?
              </Link>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={initiateGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81                z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              For institutions,{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                register your college
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google College Code Modal */}
      {showGoogleCollegeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold mb-4">Enter College Code</h3>
            <p className="text-gray-600 mb-4">
              Please enter your college code to continue with Google login.
            </p>
            <input
              type="text"
              value={collegeCodeForGoogle}
              onChange={(e) => setCollegeCodeForGoogle(e.target.value.toUpperCase())}
              className="input mb-4"
              placeholder="e.g., DEMO123"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowGoogleCollegeModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => collegeCodeForGoogle && handleGoogleLogin()}
                disabled={!collegeCodeForGoogle}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LoginPage