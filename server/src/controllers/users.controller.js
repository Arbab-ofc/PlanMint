import User from "../models/User.js";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../config/cloudinary.js";
import { deleteTempFile } from "../middlewares/upload.middleware.js";
import bcrypt from "bcryptjs";


export async function uploadAvatar(req, res, next) {
  try {
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    
    const user = await User.findById(req.userId);

    if (!user) {
      
      deleteTempFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    try {
      
      const result = await uploadToCloudinary(req.file.path, 'planmint/avatars');

      
      if (user.avatarUrl) {
        const oldPublicId = extractPublicId(user.avatarUrl);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId).catch(err => {
            console.error('Error deleting old avatar:', err);
          });
        }
      }

      
      user.avatarUrl = result.url;
      user.updatedBy = req.userId;
      await user.save();

      
      deleteTempFile(req.file.path);

      
      const updatedUser = user.toJSON();

      return res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatarUrl: result.url,
          user: updatedUser
        }
      });

    } catch (uploadError) {
      
      deleteTempFile(req.file.path);
      throw uploadError;
    }

  } catch (err) {
    
    if (req.file) {
      deleteTempFile(req.file.path);
    }
    return next(err);
  }
}


export async function deleteAvatar(req, res, next) {
  try {
    
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (!user.avatarUrl) {
      return res.status(400).json({
        success: false,
        message: "User doesn't have an avatar"
      });
    }

    
    const publicId = extractPublicId(user.avatarUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId).catch(err => {
        console.error('Error deleting avatar from Cloudinary:', err);
      });
    }

    
    user.avatarUrl = undefined;
    user.updatedBy = req.userId;
    await user.save();

    
    const updatedUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function getProfile(req, res, next) {
  try {
    
    const user = await User.findById(req.userId)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const userData = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: userData
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function updateProfile(req, res, next) {
  try {
    const { name, timezone, locale } = req.body;

    
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (name !== undefined) {
      const nameStr = String(name).trim();
      if (!nameStr || nameStr.length > 80) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 1 and 80 characters"
        });
      }
      user.name = nameStr;
    }

    
    if (timezone !== undefined) {
      user.timezone = String(timezone).trim();
    }

    
    if (locale !== undefined) {
      user.locale = String(locale).trim();
    }

    
    user.updatedBy = req.userId;

    
    await user.save();

    
    const updatedUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { password, confirmPassword } = req.body;

    
    if (typeof password !== "string" || typeof confirmPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword are required"
      });
    }

    const newPassword = password.trim();
    const newConfirm = confirmPassword.trim();

    if (!newPassword || !newConfirm) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword must not be empty"
      });
    }

    if (newPassword !== newConfirm) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match"
      });
    }

    
    if (
      newPassword.length < 8 ||
      newPassword.length > 128 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8–128 characters and include at least one letter and one number"
      });
    }

    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (user.passwordHash) {
      const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
      if (sameAsOld) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the current password"
        });
      }
    }

    
    const SALT_ROUNDS = 10;
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = hash;

    
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    
    user.updatedBy = req.userId;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    return next(err);
  }
}

export default {
  uploadAvatar,
  deleteAvatar,
  getProfile,
  updateProfile,
  changePassword,
};
