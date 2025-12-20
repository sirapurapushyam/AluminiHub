import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Image } from 'lucide-react'

const FileUpload = ({
  accept,
  multiple = false,
  maxSize = 5, // MB
  onFileSelect,
  onFileRemove,
  className = ""
}) => {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  // ... existing handlers ...

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef} 
          type="file" 
          accept={accept} 
          multiple={multiple} 
          onChange={handleChange} 
          className="sr-only" 
        />

        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Click to upload
          </button>
          <span className="hidden sm:inline"> or drag and drop</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accept ? `${accept} files` : 'Any file type'} up to {maxSize}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                {getFileIcon(file)}
                <div className="text-sm min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload