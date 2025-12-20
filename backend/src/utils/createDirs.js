const fs = require('fs');
const path = require('path');

const createDirectories = () => {
  const directories = [
    'uploads',
    'uploads/profiles',
    'uploads/documents',
    'uploads/events',
    'uploads/groups',
    'logs'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Run if called directly
if (require.main === module) {
  createDirectories();
}

module.exports = createDirectories;