import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'

const RegisterForm = ({ role, onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="md:col-span-2">
          <label className="label">Password</label>
          <div className="relative">
            <input
              {...register('password', {
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
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>
      </div>

      {/* Role-specific fields */}
      {role === 'student' && (
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
                {[1, 2, 3, 4, 5].map(year => (
                  <option key={year} value={year}>{year}st Year</option>
                ))}
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

      {role === 'alumni' && (
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

      {role === 'faculty' && (
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary"
      >
        {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Complete Registration'}
      </button>
    </form>
  )
}

export default RegisterForm