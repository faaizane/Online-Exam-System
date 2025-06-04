require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

// Teacher accounts
const teacherAccounts = [
  {
    name: 'Sadiq Khan',
    email: 'sadiq@uetpeshawar.edu.pk',
    password: 'sadiq123',
    role: 'teacher',
    department: 'Computer Science',
    designation: 'Lecturer'
  },
  {
    name: 'Imran Ali',
    email: 'imran@uetpeshawar.edu.pk',
    password: 'imran@123',
    role: 'teacher',
    department: 'Electrical Engineering',
    designation: 'Assistant Professor'
  }
];

// Student accounts
const studentAccounts = [
  {
    name: 'Faizan Elahi',
    email: '21pwbcs0872@uetpeshawar.edu.pk',
    password: '5555',
    role: 'student',
    department: 'Computer Science',
    semester: 3,
    registrationNumber: '21PWBCS0872'
  },
  {
    name: 'Abdullah',
    email: '21pwbcs0881@uetpeshawar.edu.pk',
    password: '9999',
    role: 'student',
    department: 'Electrical Engineering',
    semester: 2,
    registrationNumber: '21PWBCS0881'
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany();

    const hashAndCreate = async account => {
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(account.password, salt);
      await User.create(account);
    };

    for (const t of teacherAccounts) {
      await hashAndCreate(t);
    }
    for (const s of studentAccounts) {
      await hashAndCreate(s);
    }

    console.log('✅ All teacher and student accounts created with name, department, and semester');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();
