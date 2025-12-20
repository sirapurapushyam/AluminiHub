require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { Types } = mongoose;

// ----- Static Data Pools -----
const firstNames = [
  'Arjun','Ravi','Neha','Priya','Amit','Sonia','Deepak','Kiran','Raj','Meera',
  'Shyam','Anita','Vikram','Pooja','Rahul','Divya','Suresh','Kavita','Manoj','Rekha'
];
const lastNames = [
  'Sharma','Verma','Gupta','Reddy','Iyer','Patel','Khan','Chopra','Malhotra','Desai',
  'Joshi','Kulkarni','Singh','Nair','Mehta','Pandey','Jain','Menon','Ghosh','Banerjee'
];

const companies = [
  'Infosys','TCS','Wipro','HCL','Accenture','Amazon','Microsoft','Google','IBM','Cognizant',
  'Oracle','Capgemini','Dell','Intel','Siemens','Tech Mahindra','Facebook','LinkedIn','Salesforce','Adobe'
];

const interestsPool = [
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Web Development',
  'Full-Stack Development',
  'Frontend Development',
  'Backend Development',
  'Data Science'
];

const skillsAllLanguages = [
  'C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  'R', 'MATLAB', 'Perl', 'Shell', 'SQL', 'HTML', 'CSS'
];

// Helper functions
function randomSubset(arr, min = 2, max = 5) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedAlumni() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collegeId = new Types.ObjectId('68d6996e756761a92a550dfa');

    for (let i = 1; i <= 20; i++) {
      const firstName = randomItem(firstNames);
      const lastName  = randomItem(lastNames);
      const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@demo.com`;

      const alumni = new User({
        firstName,
        lastName,
        email,
        password: 'Demo@1234', // will be hashed automatically
        role: 'alumni',
        collegeCode: 'DEMFYH',
        college: collegeId,
        department: 'CSE',
        course: 'BTech',
        approvalStatus: 'approved',
        isEmailVerified: true,
        profile: {
          phone: `98765${10000 + i}`,
          graduationYear: 2015 + (i % 5),
          company: randomItem(companies),
          position: 'Software Engineer',
          skills: [...skillsAllLanguages],
          interests: randomSubset(interestsPool, 3, 6),
          location: 'India'
        }
      });

      await alumni.save(); // ✅ triggers pre-save middleware
    }

    console.log('🎉 20 CSE BTech alumni seeded with hashed passwords');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding alumni:', err);
    process.exit(1);
  }
}

seedAlumni();
