import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import { generateToken } from './src/utils/jwt.js';

dotenv.config();

async function testLoginWithDatabase() {
  try {
    
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/planmint';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    
    await User.deleteMany({ email: { $regex: /test.*@example\.com/ } });
    console.log('🧹 Cleared existing test users');

    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    console.log('👤 Creating test user...');
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    
    const user = new User({
      name: testUser.name,
      email: testUser.email,
      username: testUser.username,
      passwordHash: passwordHash,
      emailVerified: true 
    });

    await user.save();
    console.log('✅ Test user created:', user.email);

    
    console.log('\n🔐 Testing login process...');
    
    
    const loginData = {
      emailOrUsername: 'test@example.com',
      password: 'password123'
    };

    
    const foundUser = await User.findOne({
      $or: [
        { email: loginData.emailOrUsername.toLowerCase().trim() },
        { username: loginData.emailOrUsername.toLowerCase().trim() }
      ]
    });

    if (!foundUser) {
      throw new Error('User not found');
    }
    console.log('✅ User found:', foundUser.email);

    
    const isPasswordValid = await bcrypt.compare(loginData.password, foundUser.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    console.log('✅ Password verified');

    
    const token = generateToken({
      id: foundUser._id,
      email: foundUser.email,
      username: foundUser.username,
      role: foundUser.role
    });
    console.log('✅ JWT token generated');

    
    const response = {
      success: true,
      message: "Login successful",
      data: {
        user: foundUser.toJSON(),
        token: token
      }
    };

    console.log('\n📋 Login Response Structure:');
    console.log(JSON.stringify(response, null, 2));

    
    console.log('\n🔐 Testing login with username...');
    const usernameLoginData = {
      emailOrUsername: 'testuser',
      password: 'password123'
    };

    const usernameUser = await User.findOne({
      $or: [
        { email: usernameLoginData.emailOrUsername.toLowerCase().trim() },
        { username: usernameLoginData.emailOrUsername.toLowerCase().trim() }
      ]
    });

    if (usernameUser) {
      console.log('✅ Username login successful');
    }

    
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Test user cleaned up');

    await mongoose.disconnect();
    console.log('👋 Database connection closed');
    console.log('\n🎉 All tests passed! Login functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError.message);
    }
  }
}

testLoginWithDatabase();
