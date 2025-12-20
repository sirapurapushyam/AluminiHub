import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'

const MentorshipRequestForm = ({ mentor, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [goals, setGoals] = useState([''])

  const areasOfInterest = [
    { value: 'career', label: 'Career Development' },
    { value: 'academics', label: 'Academic Guidance' },
    { value: 'research', label: 'Research Projects' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'personal_development', label: 'Personal Development' },
    { value: 'other', label: 'Other' }
  ]

  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, ''])
    }
  }

  const removeGoal = (index) => {
    const newGoals = goals.filter((_, i) => i !== index)
    setGoals(newGoals.length === 0 ? [''] : newGoals)
  }

  const updateGoal = (index, value) => {
    const newGoals = [...goals]
    newGoals[index] = value
    setGoals(newGoals)
  }

  const onFormSubmit = (data) => {
    const filteredGoals = goals.filter(goal => goal.trim() !== '')
    onSubmit({
      ...data,
      goals: filteredGoals
    })
  }

  const watchedArea = watch('area')
  const descriptionLength = watch('description')?.length || 0

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="label">Area of Interest *</label>
        <select
          {...register('area', { required: 'Please select an area of interest' })}
          className="input w-full"
        >
          <option value="">Select an area</option>
          {areasOfInterest.map((area) => (
            <option key={area.value} value={area.value}>{area.label}</option>
          ))}
        </select>
        {errors.area && <p className="error-text">{errors.area.message}</p>}
      </div>

      <div>
        <label className="label">Your Domain/Skills</label>
        <input
          type="text"
          {...register('domain')}
          className="input w-full"
          placeholder="e.g., Web Development, Data Science, Marketing"
        />
        <p className="text-xs text-gray-500 mt-1">Mention your current domain or skills</p>
      </div>

      <div>
        <label className="label">What would you like to learn or achieve? *</label>
        <textarea
          {...register('description', { 
            required: 'Please describe what you want to learn or achieve',
            minLength: { value: 50, message: 'Description should be at least 50 characters' },
            maxLength: { value: 1000, message: 'Description should not exceed 1000 characters' }
          })}
          className="input min-h-[100px] w-full resize-y"
          placeholder="Describe your learning objectives, what you hope to achieve through this mentorship..."
        />
        <p className="text-xs text-gray-500 mt-1">{descriptionLength}/1000 characters</p>
        {errors.description && <p className="error-text">{errors.description.message}</p>}
      </div>

      <div>
        <label className="label">Specific Goals (Optional)</label>
        <p className="text-sm text-gray-600 mb-2">List up to 5 specific goals you want to achieve</p>
        {goals.map((goal, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => updateGoal(index, e.target.value)}
              className="input flex-1"
              placeholder={`Goal ${index + 1}`}
              maxLength="200"
            />
            {goals.length > 1 && (
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="btn-secondary p-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {goals.length < 5 && (
          <button
            type="button"
            onClick={addGoal}
            className="btn-secondary text-sm mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </button>
        )}
      </div>

      <div>
        <label className="label">Message to Mentor *</label>
        <textarea
          {...register('requestMessage', { 
            required: 'Please write a message to the mentor',
            maxLength: { value: 500, message: 'Message should not exceed 500 characters' }
          })}
          className="input min-h-[120px] w-full resize-y"
          placeholder="Introduce yourself, explain why you chose this mentor, and what makes you interested in this mentorship..."
        />
        {errors.requestMessage && <p className="error-text">{errors.requestMessage.message}</p>}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tips for a successful request:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Be specific about your learning goals</li>
          <li>Show genuine interest in the mentor's expertise</li>
          <li>Mention your commitment and availability</li>
          <li>Be professional and respectful</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary"
      >
        {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Send Mentorship Request'}
      </button>
    </form>
  )
}

export default MentorshipRequestForm