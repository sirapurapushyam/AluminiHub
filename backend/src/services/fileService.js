const fs = require('fs').promises;
const path = require('path');

class FileService {
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log('File deleted:', filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async moveFile(oldPath, newPath) {
    try {
      await fs.rename(oldPath, newPath);
      console.log('File moved:', oldPath, '->', newPath);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  getFileUrl(filename, folder = '') {
    // FIX: Should be backend URL for file serving
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${folder}${filename}`;
  }


  async cleanupOldFiles(directory, daysOld = 30) {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      const cutoffTime = daysOld * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > cutoffTime) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }
  }
}

module.exports = new FileService();