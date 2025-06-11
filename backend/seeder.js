require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

// Teacher accounts (15 total)
const teacherAccounts = [
  { name: 'Sadiq Khan',       email: 'sadiq@uetpeshawar.edu.pk',      password: 'sadiq123',     role: 'teacher', department: 'Computer Science',       designation: 'Lecturer' },
  { name: 'Imran Ali',        email: 'imran@uetpeshawar.edu.pk',      password: 'imran@123',     role: 'teacher', department: 'Electrical Engineering', designation: 'Assistant Professor' },
  { name: 'Ali Hassan',       email: 'alihassan@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Software Engineering',   designation: 'Lecturer' },
  { name: 'Sara Ahmed',       email: 'saraahmed@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Information Technology', designation: 'Assistant Professor' },
  { name: 'Usman Farooq',     email: 'usmanfarooq@uetpeshawar.edu.pk',password: 'password123',  role: 'teacher', department: 'Mechanical Engineering',  designation: 'Lecturer' },
  { name: 'Zainab Khan',      email: 'zainabkhan@uetpeshawar.edu.pk', password: 'password123',  role: 'teacher', department: 'Civil Engineering',       designation: 'Assistant Professor' },
  { name: 'Bilal Siddiqui',   email: 'bilalsiddiqui@uetpeshawar.edu.pk',password: 'password123', role: 'teacher', department: 'Chemical Engineering',    designation: 'Lecturer' },
  { name: 'Ayesha Mir',       email: 'ayeshamir@uetpeshawar.edu.pk',   password: 'password123',  role: 'teacher', department: 'Biomedical Engineering', designation: 'Assistant Professor' },
  { name: 'Kamran Raza',      email: 'kamranraza@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Industrial Engineering', designation: 'Lecturer' },
  { name: 'Mehwish Iftikhar', email: 'mehwishiftikhar@uetpeshawar.edu.pk',password: 'password123',role: 'teacher', department: 'Environmental Engineering',designation: 'Assistant Professor' },
  { name: 'Naveed Shah',      email: 'naveedshah@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Telecommunications',     designation: 'Lecturer' },
  { name: 'Rabia Tariq',      email: 'rabiatariq@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Mathematics',            designation: 'Assistant Professor' },
  { name: 'Shahid Afridi',    email: 'shahidafridi@uetpeshawar.edu.pk',password: 'password123',  role: 'teacher', department: 'Physics',                designation: 'Lecturer' },
  { name: 'Nida Khan',        email: 'nidakhan@uetpeshawar.edu.pk',     password: 'password123',  role: 'teacher', department: 'Chemistry',              designation: 'Assistant Professor' },
  { name: 'Owais Malik',      email: 'owaismalik@uetpeshawar.edu.pk',  password: 'password123',  role: 'teacher', department: 'Business Administration',designation: 'Lecturer' }
];

// Student accounts (200 total; 10 specific + 190 generated)
const specificStudents = [
  { name: 'Faizan Elahi',    email: '21pwbcs0001@uetpeshawar.edu.pk', password: '5555',       role: 'student', department: 'Computer Science',       semester: 3, section: 'A', registrationNumber: '21PWBCS0001' },
  { name: 'Abdullah Khan',   email: '21pwbcs0002@uetpeshawar.edu.pk', password: '9999',       role: 'student', department: 'Electrical Engineering', semester: 2, section: 'B', registrationNumber: '21PWBCS0002' },
  { name: 'Aisha Ahmed',     email: '21pwbcs0003@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Software Engineering',   semester: 4, section: 'C', registrationNumber: '21PWBCS0003' },
  { name: 'Bilal Mahmood',   email: '21pwbcs0004@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Information Technology', semester: 1, section: 'D', registrationNumber: '21PWBCS0004' },
  { name: 'Dua Nazir',       email: '21pwbcs0005@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Computer Science',       semester: 5, section: 'A', registrationNumber: '21PWBCS0005' },
  { name: 'Ehsan Ali',       email: '21pwbcs0006@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Electrical Engineering', semester: 6, section: 'B', registrationNumber: '21PWBCS0006' },
  { name: 'Fatima Noor',     email: '21pwbcs0007@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Mechanical Engineering',  semester: 2, section: 'C', registrationNumber: '21PWBCS0007' },
  { name: 'Ghulam Haider',   email: '21pwbcs0008@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Civil Engineering',       semester: 3, section: 'D', registrationNumber: '21PWBCS0008' },
  { name: 'Hajra Khan',      email: '21pwbcs0009@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Chemical Engineering',    semester: 4, section: 'A', registrationNumber: '21PWBCS0009' },
  { name: 'Imran Sheikh',    email: '21pwbcs0010@uetpeshawar.edu.pk', password: 'password123',role: 'student', department: 'Biomedical Engineering', semester: 1, section: 'B', registrationNumber: '21PWBCS0010' },
  {
    name: 'Muhammad Ahmed',
    email: '21pwbcss0021@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'A',
    registrationNumber: '21PWBCSS0021'
  },
  {
    name: 'Ali Raza',
    email: '21pwbcss0022@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'B',
    registrationNumber: '21PWBCSS0022'
  },
  {
    name: 'Hassan Shah',
    email: '21pwbcss0023@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'C',
    registrationNumber: '21PWBCSS0023'
  },
  {
    name: 'Usman Saeed',
    email: '21pwbcss0024@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'D',
    registrationNumber: '21PWBCSS0024'
  },
  {
    name: 'Asad Khan',
    email: '21pwbcss0025@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'A',
    registrationNumber: '21PWBCSS0025'
  },
  {
    name: 'Rizwan Ali',
    email: '21pwbcss0026@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'B',
    registrationNumber: '21PWBCSS0026'
  },
  {
    name: 'Khalid Mehmood',
    email: '21pwbcss0027@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'C',
    registrationNumber: '21PWBCSS0027'
  },
  {
    name: 'Salman Iqbal',
    email: '21pwbcss0028@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'D',
    registrationNumber: '21PWBCSS0028'
  },
  {
    name: 'Zubair Ahmed',
    email: '21pwbcss0029@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'A',
    registrationNumber: '21PWBCSS0029'
  },
  {
    name: 'Noman Farooq',
    email: '21pwbcss0030@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'B',
    registrationNumber: '21PWBCSS0030'
  },
  {
    name: 'Tariq Mahmood',
    email: '21pwbcss0031@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'C',
    registrationNumber: '21PWBCSS0031'
  },
  {
    name: 'Shahid Khan',
    email: '21pwbcss0032@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'D',
    registrationNumber: '21PWBCSS0032'
  },
  {
    name: 'Faisal Javed',
    email: '21pwbcss0033@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'A',
    registrationNumber: '21PWBCSS0033'
  },
  {
    name: 'Waqas Khalid',
    email: '21pwbcss0034@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'B',
    registrationNumber: '21PWBCSS0034'
  },
  {
    name: 'Bilal Aslam',
    email: '21pwbcss0035@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'C',
    registrationNumber: '21PWBCSS0035'
  },
  {
    name: 'Kamran Siddique',
    email: '21pwbcss0036@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'D',
    registrationNumber: '21PWBCSS0036'
  },
  {
    name: 'Adeel Nabi',
    email: '21pwbcss0037@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'A',
    registrationNumber: '21PWBCSS0037'
  },
  {
    name: 'Omar Aziz',
    email: '21pwbcss0038@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'B',
    registrationNumber: '21PWBCSS0038'
  },
  {
    name: 'Yousaf Ali',
    email: '21pwbcss0039@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'C',
    registrationNumber: '21PWBCSS0039'
  },
  {
    name: 'Danish Raza',
    email: '21pwbcss0040@uetpeshawar.edu.pk',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    semester: 4,
    section: 'D',
    registrationNumber: '21PWBCSS0040'
  }
];

const departments = [
  'Computer Science','Electrical Engineering','Software Engineering','Information Technology',
  'Mechanical Engineering','Civil Engineering','Chemical Engineering','Biomedical Engineering',
  'Industrial Engineering','Environmental Engineering','Telecommunications','Mathematics',
  'Physics','Chemistry','Business Administration'
];
const sections = ['A','B','C','D'];

const genericStudents = Array.from({ length: 190 }, (_, i) => {
  const idx = i + 11;                          // 11–200
  const num = String(idx).padStart(4, '0');    // "0011" … "0200"
  return {
    name: `Student ${num}`,
    email: `21pwbcs${num}@uetpeshawar.edu.pk`,
    password: 'password123',
    role: 'student',
    department: departments[i % departments.length],
    semester: ((idx - 1) % 8) + 1,
    section: sections[i % sections.length],
    registrationNumber: `21PWBCS${num}`
  };
});

const studentAccounts = [
  ...specificStudents,
  ...genericStudents
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

    console.log('✅ All teacher and student accounts created (15 teachers, 200 students)');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();

