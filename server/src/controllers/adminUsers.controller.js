import User from "../models/User.js";


export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '', role = '', emailVerified = '' } = req.query;

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = {};

    
    if (search) {
      const searchStr = String(search).trim();
      filter.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { email: { $regex: searchStr, $options: 'i' } },
        { username: { $regex: searchStr, $options: 'i' } }
      ];
    }

    
    if (role) {
      filter.role = role;
    }

    
    if (emailVerified !== '') {
      filter.emailVerified = emailVerified === 'true';
    }

    
    const users = await User.find(filter)
      .select('-passwordHash -resetToken -resetTokenExpiresAt -verificationOTP -verificationOTPExpiresAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function getUser(req, res, next) {
  try {
    const { userId } = req.params;

    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    
    const user = await User.findById(userId)
      .select('-passwordHash -resetToken -resetTokenExpiresAt -verificationOTP -verificationOTPExpiresAt');

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    return next(err);
  }
}


export async function updateUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { name, role, emailVerified, avatarUrl, timezone, locale } = req.body;

    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    
    const user = await User.findById(userId);

    
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

    
    if (role !== undefined) {
      if (!['admin', 'member'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'admin' or 'member'"
        });
      }
      user.role = role;
    }

    
    if (emailVerified !== undefined) {
      if (typeof emailVerified !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "emailVerified must be a boolean"
        });
      }
      user.emailVerified = emailVerified;
    }

    
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl ? String(avatarUrl).trim() : undefined;
    }

    
    if (timezone !== undefined) {
      user.timezone = timezone ? String(timezone).trim() : 'Asia/Kolkata';
    }

    
    if (locale !== undefined) {
      user.locale = locale ? String(locale).trim() : 'en-IN';
    }

    
    await user.save();

    
    const updatedUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return next(err);
  }
}


export async function changeUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'member'"
      });
    }

    
    const user = await User.findById(userId);

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const oldRole = user.role;

    
    if (oldRole === role) {
      return res.status(400).json({
        success: false,
        message: `User is already a ${role}`
      });
    }

    
    user.role = role;
    await user.save();

    
    const updatedUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: `User role changed from ${oldRole} to ${role} successfully`,
      data: {
        user: updatedUser,
        oldRole,
        newRole: role
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    return next(err);
  }
}


export async function verifyEmailManual(req, res, next) {
  try {
    const { userId } = req.params;

    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    
    const user = await User.findById(userId);

    
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

    
    user.emailVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiresAt = undefined;
    await user.save();

    
    const updatedUser = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "Email verified manually by admin successfully",
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    return next(err);
  }
}

export default { listUsers, getUser, updateUser, changeUserRole, verifyEmailManual };
