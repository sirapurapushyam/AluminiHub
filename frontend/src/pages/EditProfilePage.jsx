import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Camera, Lock, Plus, X, Eye, EyeOff, FileText, Trash2 } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/users'
import toast from 'react-hot-toast'
import Tag from '../components/common/Tag'

const EditProfilePage = () => {
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeUrl, setResumeUrl] = useState(null)
  const [removeResume, setRemoveResume] = useState(false)
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [skills, setSkills] = useState([])
  const [interests, setInterests] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false
  })
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      employeeId: '',
      department: '',
      designation: '',
      course: '',
      yearOfStudy: '',
      profile: {
        phone: '',
        bio: '',
        company: '',
        position: '',
        linkedIn: '',
        github: '',
        website: '',
        graduationYear: '',
        location: ''
      }
    }
  })
  
  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm()

  // Fetch current profile
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => userService.getUserProfile(),
  })

  // FIXED: Update mutation with proper data handling
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      
      // Add basic fields
      const basicFields = ['firstName', 'lastName', 'studentId', 'employeeId', 'department', 'designation', 'course', 'yearOfStudy'];
      basicFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
          formData.append(field, data[field]);
        }
      });
      
      // Add profile fields
      if (data.profile) {
        Object.keys(data.profile).forEach(key => {
          if (data.profile[key] !== undefined && data.profile[key] !== null && data.profile[key] !== '') {
            formData.append(`profile.${key}`, data.profile[key]);
          }
        });
      }
      
      // Add skills and interests as comma-separated strings
      if (skills.length > 0) {
        formData.append('skills', skills.join(','));
      }
      
      if (interests.length > 0) {
        formData.append('interests', interests.join(','));
      }
      
      // Add files
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }
      
      // FIXED: Add existing resume public_id for replacement
      if (resumeFile) {
        formData.append('resume', resumeFile);
        // If there's an existing resume, pass its public_id for replacement
        if (profileData?.user?.profile?.resumePublicId && !removeResume) {
          formData.append('existingResumePublicId', profileData.user.profile.resumePublicId);
        }
      }
      
      if (removeResume) {
        formData.append('removeResume', 'true');
      }
      
      return userService.updateProfile(formData);
    },
    onSuccess: (response) => {
      console.log('Update response:', response);
      toast.success('Profile updated successfully!');
      if (response.user) {
        setUser(response.user);
      }
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      resetPassword()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (profileData?.user) {
      const userData = profileData.user
      
      // Set basic fields
      setValue('firstName', userData.firstName || '')
      setValue('lastName', userData.lastName || '')
      setValue('email', userData.email || '')
      
      // Set role-specific fields
      if (userData.studentId) setValue('studentId', userData.studentId)
      if (userData.employeeId) setValue('employeeId', userData.employeeId)
      if (userData.department) setValue('department', userData.department)
      if (userData.designation) setValue('designation', userData.designation)
      if (userData.course) setValue('course', userData.course)
      if (userData.yearOfStudy) setValue('yearOfStudy', userData.yearOfStudy)
      
      // Set profile fields
      if (userData.profile) {
        setValue('profile.phone', userData.profile.phone || '')
        setValue('profile.bio', userData.profile.bio || '')
        setValue('profile.company', userData.profile.company || '')
        setValue('profile.position', userData.profile.position || '')
        setValue('profile.linkedIn', userData.profile.linkedIn || '')
        setValue('profile.github', userData.profile.github || '')
        setValue('profile.website', userData.profile.website || '')
        setValue('profile.graduationYear', userData.profile.graduationYear || '')
        setValue('profile.location', userData.profile.location || '')
        
        // FIXED: Handle skills and interests
        if (userData.profile.skills && Array.isArray(userData.profile.skills)) {
          const validSkills = userData.profile.skills.filter(skill => skill && skill.trim());
          setSkills(validSkills);
          console.log('Loaded skills:', validSkills);
        }
        
        if (userData.profile.interests && Array.isArray(userData.profile.interests)) {
          const validInterests = userData.profile.interests.filter(interest => interest && interest.trim());
          setInterests(validInterests);
          console.log('Loaded interests:', validInterests);
        }
        
        // Set resume URL
        if (userData.profile.resume) {
          setResumeUrl(userData.profile.resume)
        }
      }
      
      // Set profile image
      if (userData.profileImage) {
        setImagePreview(userData.profileImage)
      }
    }
  }, [profileData, setValue])

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, DOCX files are allowed')
        e.target.value = '';
        return
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resume size should be less than 5MB')
        e.target.value = '';
        return
      }
      
      setResumeFile(file)
      setRemoveResume(false)
      toast.success(`Resume "${file.name}" selected`)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        e.target.value = '';
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        e.target.value = '';
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSkill = () => {
    const trimmedSkill = newSkill.trim()
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills)
      setNewSkill('')
      console.log('Added skill, current skills:', updatedSkills);
    } else if (skills.includes(trimmedSkill)) {
      toast.error('Skill already exists')
    }
  }
  
  const addInterest = () => {
    const trimmedInterest = newInterest.trim()
    if (trimmedInterest && !interests.includes(trimmedInterest)) {
      const updatedInterests = [...interests, trimmedInterest];
      setInterests(updatedInterests)
      setNewInterest('')
      console.log('Added interest, current interests:', updatedInterests);
    } else if (interests.includes(trimmedInterest)) {
      toast.error('Interest already exists')
    }
  }

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    console.log('Removed skill, remaining skills:', updatedSkills);
  }
  
  const removeInterest = (interestToRemove) => {
    const updatedInterests = interests.filter(interest => interest !== interestToRemove);
    setInterests(updatedInterests);
    console.log('Removed interest, remaining interests:', updatedInterests);
  }

  const handleRemoveResume = () => {
    setResumeUrl(null)
    setResumeFile(null)
    setRemoveResume(true)
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  const onSubmit = (data) => {
    console.log('Form submission - Skills:', skills);
    console.log('Form submission - Interests:', interests);
    console.log('Form data:', data);
    
    // Validate required fields based on role
    if (user?.role === 'student' && !data.course) {
      toast.error('Course is required for students');
      return;
    }
    if (user?.role === 'faculty' && (!data.department || !data.designation)) {
      toast.error('Department and Designation are required for faculty');
      return;
    }
    if (user?.role === 'alumni' && !data.profile.graduationYear) {
      toast.error('Graduation year is required for alumni');
      return;
    }
    
    updateMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    passwordMutation.mutate(data)
  }

  if (isProfileLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Profile Picture</label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={imagePreview || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=96`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 border-2 border-white"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Upload a new photo</p>
                    <p className="text-xs">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
              
              {/* Resume Section */}
            <div>
              <label className="label">Resume</label>
              <div className="space-y-3">
                {/* Current Resume Display */}
                {resumeUrl && !removeResume && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {profileData?.user?.profile?.resumeOriginalName || 'Current Resume'}
                        </p>
                        <p className="text-sm text-green-700">
                          Uploaded: {profileData?.user?.profile?.resumeUploadedAt ? 
                            format(new Date(profileData.user.profile.resumeUploadedAt), 'PPp') : 
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResumeView(resumeUrl)}
                        className="text-green-700 hover:text-green-800 underline text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <span className="text-green-400">|</span>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                {/* New Resume Preview */}
                {resumeFile && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">New Resume: {resumeFile.name}</p>
                        <p className="text-sm text-blue-700">
                          Size: {(resumeFile.size / 1024 / 1024).toFixed(2)} MB | 
                          Type: {resumeFile.type === 'application/pdf' ? 'PDF' : 'Word Document'}
                        </p>
                        {resumeUrl && !removeResume && (
                          <p className="text-xs text-blue-600 mt-1">
                            ⚠️ This will replace your current resume
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeFile(null);
                        document.getElementById('resume-upload').value = '';
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Remove
                    </button>
                  </div>
                )}
                
                {/* File Upload Input */}
                <div>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 focus:outline-none"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    {resumeUrl && !removeResume ? (
                      <p>
                        <span className="font-medium">Replace current resume:</span> Upload a new file to update your existing resume. 
                        The old version will be automatically replaced.
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium">Upload your resume:</span> PDF, DOC, DOCX up to 5MB. 
                        This will help recruiters and connections learn more about your background.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="input"
                />
                {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="input"
                />
                {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="input bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  {...register('profile.phone')}
                  className="input"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Location</label>
                <input
                  {...register('profile.location')}
                  className="input"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="label">Bio</label>
              <textarea
                {...register('profile.bio')}
                className="input min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Role-specific fields */}
            {user?.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Student ID</label>
                  <input
                    {...register('studentId')}
                    className="input"
                    placeholder="Your student ID"
                  />
                </div>
                <div>
                  <label className="label">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('course', { required: 'Course is required' })}
                    className="input"
                    placeholder="Your course"
                  />
                  {errors.course && <p className="error-text">{errors.course.message}</p>}
                </div>
                <div>
                  <label className="label">Year of Study</label>
                  <input
                    {...register('yearOfStudy')}
                    type="number"
                    className="input"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="label">Expected Graduation Year</label>
                  <input
                    {...register('profile.graduationYear')}
                    type="number"
                    className="input"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
              </div>
            )}

            {user?.role === 'alumni' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Current Company</label>
                    <input
                      {...register('profile.company')}
                      className="input"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="label">Job Title</label>
                    <input
                      {...register('profile.position')}
                      className="input"
                      placeholder="Your position"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('profile.graduationYear', { 
                        required: 'Graduation year is required',
                        min: { value: 1900, message: 'Invalid graduation year' },
                        max: { value: new Date().getFullYear(), message: 'Invalid graduation year' }
                      })}
                      type="number"
                      className="input"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    {errors.profile?.graduationYear && <p className="error-text">{errors.profile.graduationYear.message}</p>}
                  </div>

                  <div>
                    <label className="label">Department</label>
                    <input
                      {...register('department')}
                      className="input"
                      placeholder="Your department"
                    />
                  </div>
                </div>
              </>
            )}

            {user?.role === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Employee ID</label>
                  <input
                    {...register('employeeId')}
                    className="input"
                    placeholder="Your employee ID"
                  />
                </div>
                <div>
                  <label className="label">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('department', { required: 'Department is required' })}
                    className="input"
                    placeholder="Your department"
                  />
                  {errors.department && <p className="error-text">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="label">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('designation', { required: 'Designation is required' })}
                    className="input"
                    placeholder="Your designation"
                  />
                  {errors.designation && <p className="error-text">{errors.designation.message}</p>}
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <label className="label">Skills & Expertise</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                    className="input flex-1"
                    placeholder="Type a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-primary"
                    disabled={!newSkill.trim()}
                  >
                    Add
                  </button>
                </div>
                
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {skills.map((skill, index) => (
                      <Tag
                        key={`skill-${index}-${skill}`}
                        text={skill}
                        variant="primary"
                        removable
                        onRemove={() => removeSkill(skill)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Add relevant skills like programming languages, frameworks, tools, etc.
                </p>
                
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
                    Debug - Current skills: {JSON.stringify(skills)}
                  </div>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="label">Interest Areas</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest()
                      }
                    }}
                    className="input flex-1"
                    placeholder="Type an interest and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="btn-primary"
                    disabled={!newInterest.trim()}
                  >
                    Add
                  </button>
                </div>
                
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {interests.map((interest, index) => (
                      <Tag
                        key={`interest-${index}-${interest}`}
                        text={interest}
                        variant="secondary"
                        removable
                        onRemove={() => removeInterest(interest)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Add your areas of interest like web development, AI/ML, design, etc.
                </p>
                
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
                    Debug - Current interests: {JSON.stringify(interests)}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">LinkedIn</label>
                  <input
                    {...register('profile.linkedIn')}
                    className="input"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="label">GitHub</label>
                  <input
                    {...register('profile.github')}
                    className="input"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Website</label>
                  <input
                    {...register('profile.website')}
                    className="input"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="btn-secondary flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary"
                >
                  {updateMutation.isPending ? <LoadingSpinner size="small" color="white" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false)
            resetPassword()
            setShowPasswordFields({ current: false, new: false })
          }}
          title="Change Password"
          size="small"
        >
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  {...passwordRegister('currentPassword', { required: 'Current password is required' })}
                  type={showPasswordFields.current ? 'text' : 'password'}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordFields.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="error-text">{passwordErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  {...passwordRegister('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number and special character'
                    }
                  })}
                  type={showPasswordFields.new ? 'text' : 'password'}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordFields.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="error-text">{passwordErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                {...passwordRegister('confirmPassword', { required: 'Please confirm your password' })}
                type="password"
                className="input"
              />
              {passwordErrors.confirmPassword && <p className="error-text">{passwordErrors.confirmPassword.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false)
                  resetPassword()
                  setShowPasswordFields({ current: false, new: false })
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="btn-primary"
              >
                {passwordMutation.isPending ? <LoadingSpinner size="small" color="white" /> : 'Change Password'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default EditProfilePage  