import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'i-will-love-to-fuck-you-scammer';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


export function generateToken(payload) {
  if (!payload || !payload.id) {
    throw new Error('generateToken: payload must contain user id');
  }

  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    username: payload.username,
    role: payload.role || 'member'
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'planmint-api'
  });
}


export function verifyToken(token) {
  if (!token) {
    throw new Error('verifyToken: token is required');
  }

  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'planmint-api'
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw err;
  }
}


export function decodeToken(token) {
  if (!token) {
    throw new Error('decodeToken: token is required');
  }
  return jwt.decode(token);
}

export default { generateToken, verifyToken, decodeToken };
