require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const College = require('../models/College');
const bcrypt = require('bcryptjs');

// "seed": "node src/utils/seed.js",

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_platform');
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (!existingSuperAdmin) {
      // Create default super admin
      const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const superAdmin = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@alumniconnect.com',
        password: hashedPassword,
        role: 'super_admin',
        approvalStatus: 'approved',
        approvedAt: new Date()
      });

      await superAdmin.save();
      console.log('Super Admin created successfully');
      console.log('Email:', superAdmin.email);
      console.log('Password:', password);
    } else {
      console.log('Super Admin already exists');
    }

    // Create sample college (optional)
    if (process.env.NODE_ENV === 'development') {
      const existingCollege = await College.findOne({ email: 'demo@democollege.edu' });
      
      if (!existingCollege) {
        const demoCollege = new College({
          name: 'Demo College',
          uniqueCode: 'DEMO123',
          email: 'demo@democollege.edu',
          phone: '+1234567890',
          address: {
            street: '123 Demo Street',
            city: 'Demo City',
            state: 'Demo State',
            zipCode: '12345',
            country: 'Demo Country'
          },
          website: 'https://democollege.edu',
          establishedYear: 2000,
          status: 'approved',
          approvedAt: new Date()
        });

        await demoCollege.save();

        const adminPassword = 'CollegeAdmin@123';
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create college admin
        const collegeAdmin = new User({
          firstName: 'College',
          lastName: 'Admin',
          email: 'admin@democollege.edu',
          password: hashedPassword,
          role: 'college_admin',
          collegeCode: demoCollege.uniqueCode,
          college: demoCollege._id,
          approvalStatus: 'approved',
          approvedAt: new Date()
        });

        await collegeAdmin.save();

        demoCollege.adminUser = collegeAdmin._id;
        await demoCollege.save();

        console.log('Demo College created successfully');
        console.log('College Code:', demoCollege.uniqueCode);
        console.log('Admin Email:', collegeAdmin.email);
        console.log('Admin Password:', adminPassword);
      }
    }

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();