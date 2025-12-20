require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedSuperAdmin = async () => {
  console.log( process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);

  
  const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
  if (existingSuperAdmin) {
    console.log('Super admin exists:', existingSuperAdmin.email);
    process.exit(0);
  }

  const superAdmin = new User({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@demo.com',
    password: 'demo123456',
    role: 'super_admin',
    approvalStatus: 'approved',
    isEmailVerified: true
  });

  await superAdmin.save();
  console.log('✅ Super admin created!');
  console.log('Email: admin@demo.com');
  console.log('Password: demo123456');
  process.exit(0);
};

seedSuperAdmin().catch(console.error);