// Seed script — wipes and repopulates the database with sample users, skills,
// a session, a chat, and a review, so you can verify the whole app end-to-end
// without manually creating data through the UI.
//
// Run with: npm run seed  (from the backend/ folder)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Session = require('../models/Session');
const Chat = require('../models/Chat');
const Review = require('../models/Review');

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Session.deleteMany({}),
    Chat.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Creating sample users...');

  const alice = await User.create({
    name: 'Alice Sharma',
    email: 'alice@example.com',
    password: passwordHash,
    bio: 'CS student who loves teaching web dev and wants to learn guitar.',
    skillsToTeach: [
      { name: 'React', category: 'Programming', proficiency: 'Advanced', description: 'Frontend with hooks, context, and routing.' },
      { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced', description: 'ES6+, async/await, closures.' },
    ],
    skillsToLearn: [
      { name: 'Guitar', category: 'Music', proficiency: 'Beginner', description: 'Want to learn basic chords.' },
      { name: 'Photography', category: 'Art', proficiency: 'Beginner', description: '' },
    ],
  });

  const bob = await User.create({
    name: 'Bob Verma',
    email: 'bob@example.com',
    password: passwordHash,
    bio: 'Music enthusiast and hobbyist photographer, learning to code.',
    skillsToTeach: [
      { name: 'Guitar', category: 'Music', proficiency: 'Advanced', description: 'Acoustic and basic music theory.' },
      { name: 'Photography', category: 'Art', proficiency: 'Intermediate', description: 'Composition and editing basics.' },
    ],
    skillsToLearn: [
      { name: 'React', category: 'Programming', proficiency: 'Beginner', description: 'Want to build a portfolio site.' },
      { name: 'Python', category: 'Programming', proficiency: 'Beginner', description: '' },
    ],
  });

  const carol = await User.create({
    name: 'Carol Mehta',
    email: 'carol@example.com',
    password: passwordHash,
    bio: 'Data science student, teaches Python, wants to learn design.',
    skillsToTeach: [
      { name: 'Python', category: 'Programming', proficiency: 'Expert', description: 'Data analysis, pandas, numpy.' },
      { name: 'Machine Learning', category: 'Programming', proficiency: 'Intermediate', description: '' },
    ],
    skillsToLearn: [
      { name: 'UI Design', category: 'Design', proficiency: 'Beginner', description: '' },
      { name: 'JavaScript', category: 'Programming', proficiency: 'Beginner', description: '' },
    ],
  });

  const dev = await User.create({
    name: 'Dev Kapoor',
    email: 'dev@example.com',
    password: passwordHash,
    bio: 'Designer who wants to get into data science.',
    skillsToTeach: [
      { name: 'UI Design', category: 'Design', proficiency: 'Advanced', description: 'Figma, design systems.' },
    ],
    skillsToLearn: [
      { name: 'Machine Learning', category: 'Programming', proficiency: 'Beginner', description: '' },
      { name: 'Python', category: 'Programming', proficiency: 'Beginner', description: '' },
    ],
  });

  console.log('Creating a sample session (Alice teaches Bob React)...');
  const session = await Session.create({
    teacher: alice._id,
    learner: bob._id,
    skill: 'React',
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    duration: 60,
    status: 'accepted',
    proposedBy: alice._id,
    notes: 'First session — cover components and props.',
  });

  console.log('Creating a completed session + review (Bob taught Alice Guitar)...');
  const pastSession = await Session.create({
    teacher: bob._id,
    learner: alice._id,
    skill: 'Guitar',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    duration: 45,
    status: 'completed',
    proposedBy: bob._id,
    notes: 'Covered basic open chords.',
  });

  await Review.create({
    session: pastSession._id,
    reviewer: alice._id,
    reviewee: bob._id,
    rating: 5,
    comment: 'Bob was a great teacher, very patient!',
  });
  await User.findByIdAndUpdate(bob._id, { avgRating: 5, ratingCount: 1 });

  console.log('Creating a sample chat between Alice and Bob...');
  await Chat.create({
    participants: [alice._id, bob._id],
    messages: [
      { sender: alice._id, text: 'Hey Bob! Looking forward to our React session tomorrow.', timestamp: new Date() },
      { sender: bob._id, text: 'Me too! I will bring some questions about hooks.', timestamp: new Date() },
    ],
    lastMessageAt: new Date(),
  });

  console.log('\nSeed complete! Sample login credentials (all use password: password123):');
  console.log('  alice@example.com');
  console.log('  bob@example.com');
  console.log('  carol@example.com');
  console.log('  dev@example.com');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
