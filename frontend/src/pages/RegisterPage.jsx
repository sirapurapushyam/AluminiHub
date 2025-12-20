import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, User, GraduationCap, Users, 
  Mail, Lock, Phone, Calendar, Check,
  ArrowRight, ArrowLeft, Eye, EyeOff,
  GraduationCapIcon
} from 'lucide-react'
import { authService } from '../services/auth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'


const RegisterPage = () => {
  const [collegeCodeStatus, setCollegeCodeStatus] = useState('');
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [collegeData, setCollegeData] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [registerType, setRegisterType] = useState(null) // 'user' or 'college'
  const [collegeCode, setCollegeCode] = useState('')
  const [formError, setFormError] = useState('') // ADD THIS LINE


  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()


  // Real-time college code validation
  useEffect(() => {
    if (collegeCode && currentStep === 1) {
      let active = true;
      // If less than 6 chars, check prefix match
      if (collegeCode.length < 6) {
        fetch(`/api/auth/college-codes/search?prefix=${collegeCode}`)
          .then(res => res.json())
          .then(data => {
            if (!active) return;
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
      } else {
        authService.verifyCollegeCode(collegeCode)
          .then(res => {
            if (!active) return;
            setCollegeCodeStatus(res.success ? 'available' : 'not-available');
          })
          .catch(() => {
            if (!active) return;
            setCollegeCodeStatus('not-available');
          });
      }
      return () => { active = false; };
    } else {
      setCollegeCodeStatus('');
    }
  }, [collegeCode, currentStep]);

  // Check if coming from Google OAuth
  useEffect(() => {
    if (location.state?.googleData) {
      const { googleData, collegeCode: googleCollegeCode } = location.state
      setValue('firstName', googleData.given_name)
      setValue('lastName', googleData.family_name)
      setValue('email', googleData.email)
      setCollegeCode(googleCollegeCode)
      verifyCollegeCode(googleCollegeCode)
    }
  }, [location.state, setValue])


  const steps = [
    { number: 1, title: 'College Verification' },
    { number: 2, title: 'Select Role' },
    { number: 3, title: 'Personal Information' }
  ]


  const verifyCollegeCode = async (code) => {
    setIsLoading(true)
    setFormError('') // Clear any previous errors
    try {
      const response = await authService.verifyCollegeCode(code)
      if (response.success) {
        setCollegeData(response.college)
        setCurrentStep(2)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid college code'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  // UPDATED submitRegistration function
  const submitRegistration = async (data) => {
    setIsLoading(true)
    setFormError('') // Clear previous errors
    
    try {
      // Transform data to match backend model
      const profileData = {
        phone: data.phone,
        graduationYear: data.graduationYear,
        company: data.currentCompany,
        position: data.jobTitle,
      };

      // Remove transformed keys from the root object
      delete data.phone;
      delete data.graduationYear;
      delete data.currentCompany;
      delete data.jobTitle;

      const registrationData = {
        ...data,
        profile: profileData,
        role: selectedRole,
        collegeCode: collegeCode,
        ...(location.state?.googleData && {
          googleId: location.state.googleData.id,
          profileImage: location.state.googleData.picture,
          tempToken: location.state.tempToken
        })
      }

      const response = await authService.register(registrationData)
      
      if (response.success) {
        toast.success(response.message || 'Registration successful! Please wait for approval.')
        navigate('/login')
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false)
    }
  }


  // UPDATED submitCollegeRegistration function
  const submitCollegeRegistration = async (data) => {
    setIsLoading(true)
    setFormError('') // Clear previous errors
    
    try {
      // Transform the data to match backend expectations
      const transformedData = {
        name: data.name,
        email: data.collegeEmail,
        phone: data.collegePhone,
        address: {
          street: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        },
        website: data.website,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword
      }
      
      const response = await authService.registerCollege(transformedData)
      
      if (response.success) {
        toast.success(response.message || 'College registration submitted! You will receive an email once approved.')
        navigate('/login')
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
      console.error('College registration error:', error);
    } finally {
      setIsLoading(false)
    }
  }


  const roles = [
    {
      value: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Current student at the institution',
      color: 'green'
    },
    {
      value: 'alumni',
      title: 'Alumni',
      icon: User,
      description: 'Graduated from the institution',
      color: 'blue'
    },
    {
      value: 'faculty',
      title: 'Faculty',
      icon: Users,
      description: 'Teaching or administrative staff',
      color: 'purple'
    }
  ]


  // Registration Type Selection
  if (!registerType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-2xl"
        >
          <Link to="/" className="flex justify-center mb-8">
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


          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            <h2 className="text-3xl font-bold text-center mb-8">Get Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRegisterType('user')}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-primary-500 transition-all text-center"
              >
                <User className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Join Your College</h3>
                <p className="text-gray-600">Register as a student, alumni, or faculty member</p>
              </motion.button>


              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRegisterType('college')}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-primary-500 transition-all text-center"
              >
                <Building2 className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Register Institution</h3>
                <p className="text-gray-600">Add your college to Alumni Connect platform</p>
              </motion.button>
            </div>


            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }


  // College Registration Form
  if (registerType === 'college') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-2xl"
        >
          <Link to="/" className="flex justify-center mb-8">
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


          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            <button
              onClick={() => setRegisterType(null)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>


            <h2 className="text-3xl font-bold text-center mb-8">Register Your Institution</h2>
            
            {/* ADD ERROR DISPLAY HERE */}
            {formError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{formError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(submitCollegeRegistration)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Institution Name</label>
                  <input
                    {...register('name', { required: 'Institution name is required' })}
                    className="input"
                    placeholder="e.g., Harvard University"
                  />
                  {errors.name && <p className="error-text">{errors.name.message}</p>}
                </div>


                <div>
                  <label className="label">Website</label>
                  <input
                    {...register('website', { 
                      required: 'Website is required',
                      pattern: {
                        value: /^https?:\/\/.+\..+/,
                        message: 'Invalid website URL'
                      }
                    })}
                    className="input"
                    placeholder="https://www.university.edu"
                  />
                  {errors.website && <p className="error-text">{errors.website.message}</p>}
                </div>


                <div>
                  <label className="label">Established Year</label>
                                    <input
                    {...register('establishedYear')}
                    type="number"
                    className="input"
                    placeholder="1850"
                  />
                  {errors.establishedYear && <p className="error-text">{errors.establishedYear.message}</p>}
                </div>


                <div className="md:col-span-2">
                  <label className="label">Street Address</label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    className="input"
                    placeholder="123 University Ave"
                  />
                  {errors.address && <p className="error-text">{errors.address.message}</p>}
                </div>


                <div>
                  <label className="label">City</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    className="input"
                    placeholder="Cambridge"
                  />
                  {errors.city && <p className="error-text">{errors.city.message}</p>}
                </div>


                <div>
                  <label className="label">State</label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    className="input"
                    placeholder="MA"
                  />
                  {errors.state && <p className="error-text">{errors.state.message}</p>}
                </div>


                <div>
                  <label className="label">Country</label>
                  <input
                    {...register('country', { required: 'Country is required' })}
                    className="input"
                    placeholder="United States"
                  />
                  {errors.country && <p className="error-text">{errors.country.message}</p>}
                </div>


                <div>
                  <label className="label">Zip Code</label>
                  <input
                    {...register('zipCode', { required: 'Zip code is required' })}
                    className="input"
                    placeholder="02138"
                  />
                  {errors.zipCode && <p className="error-text">{errors.zipCode.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label">Institution Email</label>
                    <input
                      {...register('collegeEmail', { required: 'Institution email is required' })}
                      type="email"
                      className="input"
                      placeholder="contact@university.edu"
                    />
                    {errors.collegeEmail && <p className="error-text">{errors.collegeEmail.message}</p>}
                </div>
                <div>
                    <label className="label">Institution Phone</label>
                    <input
                      {...register('collegePhone', { required: 'Institution phone is required' })}
                      className="input"
                      placeholder="+1 234 567 8900"
                    />
                    {errors.collegePhone && <p className="error-text">{errors.collegePhone.message}</p>}
                </div>
              </div>



              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Admin Account Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      {...register('adminFirstName', { required: 'First name is required' })}
                      className="input"
                      placeholder="John"
                    />
                    {errors.adminFirstName && <p className="error-text">{errors.adminFirstName.message}</p>}
                  </div>


                  <div>
                    <label className="label">Last Name</label>
                    <input
                      {...register('adminLastName', { required: 'Last name is required' })}
                      className="input"
                      placeholder="Doe"
                    />
                    {errors.adminLastName && <p className="error-text">{errors.adminLastName.message}</p>}
                  </div>


                  <div>
                    <label className="label">Email</label>
                    <input
                      {...register('adminEmail', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input"
                      placeholder="admin@university.edu"
                    />
                    {errors.adminEmail && <p className="error-text">{errors.adminEmail.message}</p>}
                  </div>


                  <div>
                    <label className="label">Phone</label>
                    <input
                      {...register('adminPhone', { required: 'Phone is required' })}
                      className="input"
                      placeholder="+1 234 567 8900"
                    />
                    {errors.adminPhone && <p className="error-text">{errors.adminPhone.message}</p>}
                  </div>


                  <div className="md:col-span-2">
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        {...register('adminPassword', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="input pr-10"
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
                    {errors.adminPassword && <p className="error-text">{errors.adminPassword.message}</p>}
                  </div>
                </div>
              </div>


              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }


  // User Registration - Multi-step Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-2xl"
      >
        <Link to="/" className="flex justify-center mb-8">
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


        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center ${index !== 0 ? 'ml-4' : ''}`}>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${currentStep >= step.number 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'}
                  `}>
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span className={`ml-2 text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>


        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <button
            onClick={() => setRegisterType(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>


          <AnimatePresence mode="wait">
            {/* Step 1: College Verification */}
            {currentStep === 1 && !collegeData && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-center mb-6">Enter Your College Code</h2>
                <p className="text-gray-600 text-center mb-8">
                  Please enter the unique code provided by your institution
                </p>
                
                {/* ADD ERROR DISPLAY HERE FOR STEP 1 */}
                {formError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                    <p className="text-sm">{formError}</p>
                  </div>
                )}
                
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (collegeCode) {
                    verifyCollegeCode(collegeCode)
                  }
                }}>
                  <div className="max-w-md mx-auto">
                    <input
                      type="text"
                      value={collegeCode}
                      onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                      className="input text-center text-2xl font-mono tracking-wider"
                      placeholder="DEMO123"
                      disabled={isLoading}
                    />
                    {collegeCode && collegeCodeStatus === 'valid' && (
                      <p className="text-green-600 text-sm mt-2 text-center">Valid college code</p>
                    )}
                    {collegeCode && collegeCodeStatus === 'invalid' && (
                      <p className="text-red-600 text-sm mt-2 text-center">Invalid college code</p>
                    )}
                    {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'available' && (
                      <p className="text-green-600 text-sm mt-2 text-center">College code is valid</p>
                    )}
                    {collegeCode && collegeCode.length >= 6 && collegeCodeStatus === 'not-available' && (
                      <p className="text-red-600 text-sm mt-2 text-center">College code not found</p>
                    )}
                    
                    <button
                      type="submit"
                      disabled={!collegeCode || isLoading}
                      className="btn-primary w-full mt-6"
                    >
                      {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Verify Code'}
                    </button>
                  </div>
                </form>


                <p className="text-center text-sm text-gray-600 mt-8">
                  Don't have a college code?{' '}
                  <button
                    onClick={() => setRegisterType(null)}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Register your institution
                  </button>
                </p>
              </motion.div>
            )}


            {/* Step 2: Role Selection */}
            {currentStep === 2 && collegeData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Select Your Role</h2>
                  <p className="text-gray-600">at {collegeData.name}</p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {roles.map((role) => (
                    <motion.button
                      key={role.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-6 border-2 rounded-2xl transition-all ${
                        selectedRole === role.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <role.icon className={`w-12 h-12 mx-auto mb-3 ${
                        selectedRole === role.value ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold mb-1">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </motion.button>
                  ))}
                </div>


                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setCurrentStep(1)
                      setCollegeData(null)
                      setSelectedRole('')
                      setFormError('') // Clear any errors
                    }}
                    className="btn-secondary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={() => selectedRole && setCurrentStep(3)}
                    disabled={!selectedRole}
                    className="btn-primary"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}


            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-center mb-                8">Complete Your Profile</h2>

                {/* ADD ERROR DISPLAY HERE FOR STEP 3 */}
                {formError && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(submitRegistration)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">First Name</label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        className="input"
                        placeholder="John"
                      />
                      {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
                    </div>


                    <div>
                      <label className="label">Last Name</label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        className="input"
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
                    </div>


                    <div>
                      <label className="label">Email</label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="input"
                        placeholder="john.doe@email.com"
                        readOnly={location.state?.googleData}
                      />
                      {errors.email && <p className="error-text">{errors.email.message}</p>}
                    </div>


                    <div>
                      <label className="label">Phone</label>
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        className="input"
                        placeholder="+1 234 567 8900"
                      />
                      {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                    </div>


                    {!location.state?.googleData && (
                      <div className="md:col-span-2">
                        <label className="label">Password</label>
                        <div className="relative">
                          <input
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                              },
                              pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                message: 'Password must contain uppercase, lowercase, number and special character'
                              }
                            })}
                            type={showPassword ? 'text' : 'password'}
                            className="input pr-10"
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
                        {errors.password && <p className="error-text">{errors.password.message}</p>}
                      </div>
                    )}
                  </div>


                  {/* Role-specific fields */}
                  {selectedRole === 'student' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Student ID</label>
                          <input
                            {...register('studentId', { required: 'Student ID is required' })}
                            className="input"
                            placeholder="STU123456"
                          />
                          {errors.studentId && <p className="error-text">{errors.studentId.message}</p>}
                        </div>


                        <div>
                          <label className="label">Year of Study</label>
                          <select
                            {...register('yearOfStudy', { required: 'Year of study is required' })}
                            className="input"
                          >
                            <option value="">Select year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                            <option value="5">5th Year</option>
                          </select>
                          {errors.yearOfStudy && <p className="error-text">{errors.yearOfStudy.message}</p>}
                        </div>
                      </div>


                      <div>
                        <label className="label">Course/Program</label>
                        <input
                          {...register('course', { required: 'Course is required' })}
                          className="input"
                          placeholder="e.g., Computer Science"
                        />
                        {errors.course && <p className="error-text">{errors.course.message}</p>}
                      </div>
                    </>
                  )}


                  {selectedRole === 'alumni' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Graduation Year</label>
                          <input
                            {...register('graduationYear', { 
                              required: 'Graduation year is required',
                              min: { value: 1950, message: 'Invalid year' },
                              max: { value: new Date().getFullYear(), message: 'Invalid year' }
                            })}
                            type="number"
                            className="input"
                            placeholder={new Date().getFullYear()}
                          />
                          {errors.graduationYear && <p className="error-text">{errors.graduationYear.message}</p>}
                        </div>


                        <div>
                          <label className="label">Degree</label>
                          <input
                            {...register('degree', { required: 'Degree is required' })}
                            className="input"
                            placeholder="e.g., B.Tech Computer Science"
                          />
                          {errors.degree && <p className="error-text">{errors.degree.message}</p>}
                        </div>
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Current Company</label>
                          <input
                            {...register('currentCompany')}
                            className="input"
                            placeholder="e.g., Google"
                          />
                        </div>


                        <div>
                          <label className="label">Job Title</label>
                          <input
                            {...register('jobTitle')}
                            className="input"
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                      </div>
                    </>
                  )}


                  {selectedRole === 'faculty' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">Employee ID</label>
                          <input
                            {...register('employeeId', { required: 'Employee ID is required' })}
                            className="input"
                            placeholder="EMP123456"
                          />
                          {errors.employeeId && <p className="error-text">{errors.employeeId.message}</p>}
                        </div>


                        <div>
                          <label className="label">Department</label>
                          <input
                            {...register('department', { required: 'Department is required' })}
                            className="input"
                            placeholder="e.g., Computer Science"
                          />
                          {errors.department && <p className="error-text">{errors.department.message}</p>}
                        </div>
                      </div>


                      <div>
                        <label className="label">Designation</label>
                        <input
                          {...register('designation', { required: 'Designation is required' })}
                          className="input"
                          placeholder="e.g., Associate Professor"
                        />
                        {errors.designation && <p className="error-text">{errors.designation.message}</p>}
                      </div>
                    </>
                  )}


                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2)
                        setFormError('') // Clear any errors when going back
                      }}
                      className="btn-secondary"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage