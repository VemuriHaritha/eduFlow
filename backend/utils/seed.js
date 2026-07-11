// Seed script: populates the database with demo data.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany()
  ]);

  console.log('Creating users...');
  const admin = await User.create({ name: 'Admin User', email: 'admin@eduflow.com', password: 'password123', role: 'admin' });
  const instructor = await User.create({ name: 'Jane Instructor', email: 'instructor@eduflow.com', password: 'password123', role: 'instructor', bio: 'Full-stack developer & educator', experience: '8 years', specialization: 'Web Development' });
  const student = await User.create({ name: 'Sam Student', email: 'student@eduflow.com', password: 'password123', role: 'student' });

  console.log('Creating categories...');
  const categories = await Category.insertMany([
    { name: 'Programming' },
    { name: 'Web Development' },
    { name: 'Data Science' },
    { name: 'AI' },
    { name: 'DevOps' }
  ]);

  console.log('Creating a sample course...');
  const course = await Course.create({
    title: 'Complete MERN Stack Development',
    description: 'Learn to build full-stack web applications using MongoDB, Express, React, and Node.js from scratch.',
    category: categories[1]._id,
    difficulty: 'Intermediate',
    duration: 40,
    price: 0,
    language: 'English',
    tags: ['MERN', 'React', 'Node.js', 'MongoDB'],
    instructor: instructor._id,
    isPublished: true,
    isDraft: false
  });

  await Lesson.insertMany([
    { course: course._id, title: 'Introduction to MERN Stack', description: 'Overview of the stack', duration: 15, order: 1 },
    { course: course._id, title: 'Setting up Express Server', description: 'Building your first API', duration: 25, order: 2 },
    { course: course._id, title: 'MongoDB & Mongoose Basics', description: 'Working with the database', duration: 30, order: 3 }
  ]);

  console.log('Seed complete!');
  console.log('Admin login: admin@eduflow.com / password123');
  console.log('Instructor login: instructor@eduflow.com / password123');
  console.log('Student login: student@eduflow.com / password123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
