import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


async function testDatabaseConnection() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/planmint';
    
    console.log('🔍 Testing database connection...');
    console.log('📍 Connection URI:', uri);
    
    await mongoose.connect(uri);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MongoDB is running: brew services start mongodb-community (macOS)');
    console.log('2. Check if MongoDB is running on port 27017');
    console.log('3. Verify your .env file has correct MONGODB_URI');
    console.log('4. Try connecting manually: mongosh mongodb://localhost:27017/planmint');
  }
}

testDatabaseConnection();
