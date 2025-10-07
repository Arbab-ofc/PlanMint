import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateOTP } from "../utils/otp.js";
import { sendTemplate } from "../emails/mailer.js";
import { generateToken } from "../utils/jwt.js";
import { validatePassword, validateEmail, validateUsername } from "../utils/validators.js";


export async function signup(req, res, next) {
  try {
    const { name, email, username, password, confirmPassword } = req.body;

    
    if (!name || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, username, password)"
      });
    }

    
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirmPassword is required"
      });
    }

    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({
        success: false,
        message: "password and confirmPassword do not match"
      });
    }

    
    const emailStr = String(email).toLowerCase().trim();
    if (!validateEmail(emailStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    
    const usernameStr = String(username).toLowerCase().trim();
    if (!validateUsername(usernameStr)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only"
      });
    }

    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    
    const existingUser = await User.findOne({
      $or: [{ email: emailStr }, { username: usernameStr }]
    });

    if (existingUser) {
      if (existingUser.email === emailStr) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered"
        });
      }
      if (existingUser.username === usernameStr) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken"
        });
      }
    }

    
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const salt = await bcrypt.genSalt(rounds);
    const passwordHash = await bcrypt.hash(String(password), salt);

    
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    
    const user = new User({
      name: String(name).trim(),
      email: emailStr,
      username: usernameStr,
      passwordHash,
      emailVerified: false, 
      verificationOTP: otp,
      verificationOTPExpiresAt: otpExpiresAt
    });

    await user.save();

    
    try {
      await sendTemplate('verifyEmailOTP', emailStr, {
        name: user.name,
        otp,
        expiryMinutes: 15
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Signup successful! Please check your email for verification code.",
      data: {
        userId: user._id,
        email: user.email,
        otpExpiresAt
      }
    });

  } catch (err) {
    if (err && err.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0] || "field";
      return res.status(409).json({
        success: false,
        message: `${key} already in use`
      });
    }
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return next(err);
  }
}


export async function verifySignupOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const emailStr = String(email).toLowerCase().trim();
    const otpStr = String(otp).trim();

    
    const user = await User.findOne({ email: emailStr });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    
    if (!user.verificationOTP) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one."
      });
    }

    
    if (!user.verificationOTPExpiresAt || new Date() > user.verificationOTPExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one."
      });
    }

    
    if (user.verificationOTP !== otpStr) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    
    user.emailVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiresAt = undefined;
    await user.save();

    
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    
    const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; 
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    
    const userData = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      data: {
        user: userData,
        token
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function resendVerificationOTP(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const emailStr = String(email).toLowerCase().trim();

    
    const user = await User.findOne({ email: emailStr });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    
    user.verificationOTP = otp;
    user.verificationOTPExpiresAt = otpExpiresAt;
    await user.save();

    
    try {
      await sendTemplate('resendOTP', emailStr, {
        name: user.name,
        otp,
        expiryMinutes: 15
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully! Please check your email.",
      data: {
        email: user.email,
        otpExpiresAt
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function login(req, res, next) {
  try {
    const { emailOrUsername, password } = req.body;

    
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required"
      });
    }

    const identifier = String(emailOrUsername).toLowerCase().trim();

    
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }


    
    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);

    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    
    const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; 
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    
    const userData = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        token
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function logout(req, res, next) {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0) 
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err) {
    return next(err);
  }
}


export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const emailStr = String(email).toLowerCase().trim();

    if (!validateEmail(emailStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    
    const user = await User.findOne({ email: emailStr });

    
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset code has been sent."
      });
    }

    
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before resetting password"
      });
    }

    
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    
    user.resetToken = otp;
    user.resetTokenExpiresAt = otpExpiresAt;
    await user.save();

    
    try {
      await sendTemplate('forgotPasswordOTP', emailStr, {
        name: user.name,
        otp,
        expiryMinutes: 15
      });
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset code sent successfully! Please check your email.",
      data: {
        email: user.email,
        otpExpiresAt
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (email, otp, newPassword, confirmPassword)"
      });
    }

    
    if (String(newPassword) !== String(confirmPassword)) {
      return res.status(400).json({
        success: false,
        message: "newPassword and confirmPassword do not match"
      });
    }

    const emailStr = String(email).toLowerCase().trim();
    const otpStr = String(otp).trim();

    
    if (!validateEmail(emailStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    
    const user = await User.findOne({ email: emailStr });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first"
      });
    }

    
    if (!user.resetToken) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new one."
      });
    }

    
    if (!user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Password reset code has expired. Please request a new one."
      });
    }

    
    if (user.resetToken !== otpStr) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset code"
      });
    }

    
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const salt = await bcrypt.genSalt(rounds);
    const passwordHash = await bcrypt.hash(String(newPassword), salt);

    
    user.passwordHash = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login with your new password.",
      data: {
        email: user.email
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function checkAvailability(req, res, next) {
  try {
    const { email, username } = req.query;

    
    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Either email or username is required"
      });
    }

    const result = {
      email: null,
      username: null
    };

    
    if (email) {
      const emailStr = String(email).toLowerCase().trim();
      
      
      if (!validateEmail(emailStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      
      const emailUser = await User.findOne({ email: emailStr });
      result.email = {
        value: emailStr,
        available: !emailUser,
        message: emailUser ? "Email is already taken" : "Email is available"
      };
    }

    
    if (username) {
      const usernameStr = String(username).toLowerCase().trim();
      
      
      if (!validateUsername(usernameStr)) {
        return res.status(400).json({
          success: false,
          message: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only"
        });
      }

      
      const usernameUser = await User.findOne({ username: usernameStr });
      result.username = {
        value: usernameStr,
        available: !usernameUser,
        message: usernameUser ? "Username is already taken" : "Username is available"
      };
    }

    return res.status(200).json({
      success: true,
      message: "Availability check completed",
      data: result
    });

  } catch (err) {
    return next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    
    const user = req.user;
    
    
    const userData = user.toJSON();
    delete userData.passwordHash;
    delete userData.verificationOTP;
    delete userData.verificationOTPExpiresAt;
    
    return res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        user: userData
      }
    });
  } catch (err) {
    return next(err);
  }
}

export default { signup, verifySignupOTP, resendVerificationOTP, login, logout, forgotPassword, resetPassword, checkAvailability, getCurrentUser };
