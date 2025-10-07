import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';


export async function authenticate(req, res, next) {
  try {
    
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message || "Invalid or expired token"
      });
    }

    
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    
    const user = await User.findById(decoded.id).select('-passwordHash -resetToken -resetTokenExpiresAt -verificationOTP -verificationOTPExpiresAt');

    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again."
      });
    }

    
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource"
      });
    }

    
    req.user = user;
    req.userId = user._id;

    
    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: err.message
    });
  }
}


export function requireAdmin(req, res, next) {
  try {
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    
    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: err.message
    });
  }
}


export function optionalAuth(req, res, next) {
  try {
    
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    
    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      req.user = null;
      req.userId = null;
      return next();
    }

    
    if (!decoded || !decoded.id) {
      req.user = null;
      req.userId = null;
      return next();
    }

    
    User.findById(decoded.id)
      .select('-passwordHash -resetToken -resetTokenExpiresAt -verificationOTP -verificationOTPExpiresAt')
      .then(user => {
        if (user && user.emailVerified) {
          req.user = user;
          req.userId = user._id;
        } else {
          req.user = null;
          req.userId = null;
        }
        next();
      })
      .catch(() => {
        req.user = null;
        req.userId = null;
        next();
      });

  } catch (err) {
    req.user = null;
    req.userId = null;
    next();
  }
}

export default { authenticate, requireAdmin, optionalAuth };
