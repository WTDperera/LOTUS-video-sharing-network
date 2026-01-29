const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
require('dotenv').config();

// Sample data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=EF4444&color=fff'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=10B981&color=fff'
  }
];

// No mock videos - users will upload real videos
// No mock comments - users will create real comments

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lotus_video');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('\n👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      // Don't hash password manually - User model will hash it automatically via pre-save hook
      const user = await User.create({
        ...userData
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`\n🔐 Test Account Credentials:`);
    console.log(`   Email: john@example.com`);
    console.log(`   Password: password123`);
    console.log(`\n🌐 You can now login and start uploading videos!`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedDatabase();
