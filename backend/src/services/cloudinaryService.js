const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}); 

const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      console.log('=== CLOUDINARY UPLOAD DEBUG ===');
      console.log('File details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // For resume replacement, use existing public_id if available
      let publicId;
      
      if (file.fieldname === 'resume' && req.body.existingResumePublicId) {
        publicId = req.body.existingResumePublicId;
        console.log('Replacing existing resume with public_id:', publicId);
      } else {
        const timestamp = Date.now();
        const cleanName = file.originalname
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 50);
        publicId = `${cleanName}_${timestamp}`;
      }

      let params = {
        folder: `alumni-connect/${folder}`,
        public_id: publicId,
        overwrite: true,
      };

      // Always use resource_type 'raw' for resume uploads (PDF/DOC/DOCX)
      // This ensures full document is accessible for viewing/downloading in browser
      if (
        file.fieldname === 'resume' ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        params.resource_type = 'raw';
        params.flags = 'immutable_cache';
      } else if (file.mimetype.startsWith('image/')) {
        params.resource_type = 'image';
        params.transformation = [
          { width: 500, height: 500, crop: 'limit', quality: 'auto' }
        ];
        params.format = 'auto';
      }

      console.log('Cloudinary params:', params);
      return params;
    }
  });
};

const upload = (folder) => multer({ 
  storage: createStorage(folder),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype);
    
    const allowedTypes = {
      'image/jpeg': true,
      'image/jpg': true,
      'image/png': true,
      'application/pdf': true,
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
    };

    if (allowedTypes[file.mimetype]) {
      console.log('File type allowed');
      cb(null, true);
    } else {
      console.log('File type not allowed:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.`), false);
    }
  }
});

const deleteFile = async (publicId) => {
  try {
    console.log('Attempting to delete file with publicId:', publicId);
    
    // Try different resource types
    let result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'auto',
      invalidate: true 
    });
    
    if (result.result !== 'ok') {
      result = await cloudinary.uploader.destroy(publicId, { 
        resource_type: 'image',
        invalidate: true 
      });
    }
    
    if (result.result !== 'ok') {
      result = await cloudinary.uploader.destroy(publicId, { 
        resource_type: 'raw',
        invalidate: true 
      });
    }
    
    console.log('File deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return { result: 'error', error: error.message };
  }
};

// FIXED: Generate viewing URL for PDFs that opens properly in browser
const getViewingUrl = (publicId, mimeType = 'application/pdf') => {
  try {
    // Always use resource_type 'raw' for resume viewing
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      secure: true
    });
  } catch (error) {
    console.error('Error generating viewing URL:', error);
    return null;
  }
};

// Generate download URL (forces download)
const getDownloadUrl = (publicId, originalName, mimeType = 'application/pdf') => {
  try {
    const fileName = originalName || 'document';
    const resourceType = mimeType === 'application/pdf' ? 'auto' : 'raw';
    
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      flags: `attachment:${fileName}`,
      secure: true
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return null;
  }
};

module.exports = {
  upload,
  deleteFile,
  getViewingUrl,
  getDownloadUrl,
  cloudinary
};