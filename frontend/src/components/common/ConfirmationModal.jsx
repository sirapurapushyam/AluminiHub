import React, { useState } from 'react'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import { AlertTriangle } from 'lucide-react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  isLoading = false,
  requiresReason = false,
  reasonLabel = 'Reason'
}) => {
  const [reason, setReason] = useState('')

  const confirmColors = {
    primary: 'btn-primary',
    danger: 'btn-danger'
  }

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason : undefined)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="flex items-start space-x-4">
        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${confirmColor === 'danger' ? 'bg-red-100' : 'bg-primary-100'} sm:mx-0 sm:h-10 sm:w-10`}>
          <AlertTriangle className={`h-6 w-6 ${confirmColor === 'danger' ? 'text-red-600' : 'text-primary-600'}`} />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {requiresReason && (
        <div className="mt-4">
          <label className="label">{reasonLabel}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input min-h-[80px]"
            placeholder="Provide a brief reason..."
          />
        </div>
      )}

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <button
          type="button"
          className={`${confirmColors[confirmColor]} w-full sm:w-auto`}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="small" color="white" /> : confirmText}
        </button>
        <button type="button" className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0" onClick={onClose}>
          {cancelText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmationModal