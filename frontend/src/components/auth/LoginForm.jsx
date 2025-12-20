import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeCodeStatus, setCollegeCodeStatus] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm()

  // Real-time college code validation (prefix + full code)
  React.useEffect(() => {
    if (collegeCode) {
      let active = true;
      if (collegeCode.length < 6 && collegeCode.length >= 3) {
        import('../../services/api').then(({ default: api }) => {
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
        import('../../services/auth').then(({ authService }) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="error-text">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="label">College Code (Optional)</label>
        <input
          type="text"
          value={collegeCode}
          onChange={e => setCollegeCode(e.target.value.toUpperCase())}
          className="input text-center text-2xl font-mono tracking-wider"
          placeholder="Enter your college code"
        />
        {collegeCode && collegeCode.length < 6 && collegeCode.length >= 3 && collegeCodeStatus === 'valid' && (
          <p className="text-green-600 text-sm mt-2 text-center">Valid college code</p>
        )}
        {collegeCode && collegeCode.length < 6 && collegeCode.length >= 3 && collegeCodeStatus === 'invalid' && (
          <p className="text-red-600 text-sm mt-2 text-center">Invalid college code</p>
        )}
        {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'available' && (
          <p className="text-green-600 text-sm mt-2 text-center">College code is available</p>
        )}
        {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'not-available' && (
          <p className="text-red-600 text-sm mt-2 text-center">College code not available</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Required for alumni/faculty. Students can leave blank.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary"
      >
        {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginForm