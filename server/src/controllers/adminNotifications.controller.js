import Notification from "../models/Notification.js";
import User from "../models/User.js";


export async function listUserNotifications(req, res, next) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly, type } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    const user = await User.findById(userId).select('username email name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const query = {
      userId: userId
    };

    
    if (unreadOnly === 'true') {
      query.readAt = null;
    }

    
    if (type) {
      const validTypes = [
        'task_assigned',
        'task_status_changed',
        'task_due_soon',
        'task_overdue',
        'comment_added',
        'project_member_added',
        'project_role_changed'
      ];
      
      if (validTypes.includes(type)) {
        query.type = type;
      }
    }

    
    const total = await Notification.countDocuments(query);

    
    const notifications = await Notification.find(query)
      .populate('userId', 'username email name avatarUrl')
      .populate('ref.projectId', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      readAt: null
    });

    return res.status(200).json({
      success: true,
      message: "User notifications retrieved successfully",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name
        },
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function deleteNotification(req, res, next) {
  try {
    const { notificationId } = req.params;

    
    const notification = await Notification.findById(notificationId)
      .populate('userId', 'username email name');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    
    const notificationInfo = {
      _id: notification._id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message
    };

    
    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: {
        notification: notificationInfo
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function broadcast(req, res, next) {
  try {
    const { type, message, userIds, entityType, entityId, projectId, meta } = req.body;

    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Notification type is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    
    const validTypes = [
      'task_assigned',
      'task_status_changed',
      'task_due_soon',
      'task_overdue',
      'comment_added',
      'project_member_added',
      'project_role_changed'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type"
      });
    }

    
    const messageStr = String(message).trim();
    if (!messageStr || messageStr.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 1 and 500 characters"
      });
    }

    
    let targetUserIds = [];

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      
      targetUserIds = userIds;
    } else {
      
      const allUsers = await User.find({}, '_id').lean();
      targetUserIds = allUsers.map(u => u._id);
    }

    if (targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users found to send notifications"
      });
    }

    
    if (entityType) {
      const validEntityTypes = ['task', 'project', 'contact'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entity type. Must be 'task', 'project', or 'contact'"
        });
      }
    }

    
    const ref = {};
    if (entityType && entityId) {
      ref.entityType = entityType;
      ref.entityId = entityId;
      if (projectId) {
        ref.projectId = projectId;
      }
    } else {
      
      ref.entityType = 'project';
      ref.entityId = req.userId; 
    }

    
    const notifications = targetUserIds.map(userId => ({
      userId: userId,
      type: type,
      ref: ref,
      message: messageStr,
      meta: meta || { broadcastBy: req.userId, broadcastAt: new Date() }
    }));

    
    const createdNotifications = await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: `Broadcast sent successfully to ${createdNotifications.length} users`,
      data: {
        count: createdNotifications.length,
        type: type,
        message: messageStr,
        targetUsers: targetUserIds.length
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


export async function deleteUserNotifications(req, res, next) {
  try {
    const { userId } = req.params;

    
    const user = await User.findById(userId).select('username email name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const result = await Notification.deleteMany({ userId: userId });

    return res.status(200).json({
      success: true,
      message: "All user notifications deleted successfully",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name
        },
        deletedCount: result.deletedCount
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function getNotificationStats(req, res, next) {
  try {
    
    const totalNotifications = await Notification.countDocuments();

    
    const unreadNotifications = await Notification.countDocuments({ readAt: null });

    
    const notificationsByType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    
    const topUsers = await Notification.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ['$readAt', null] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          unreadCount: 1,
          username: '$user.username',
          email: '$user.email',
          name: '$user.name'
        }
      }
    ]);

    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNotifications = await Notification.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    return res.status(200).json({
      success: true,
      message: "Notification statistics retrieved successfully",
      data: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: totalNotifications - unreadNotifications,
        recent24h: recentNotifications,
        byType: notificationsByType,
        topUsers: topUsers
      }
    });

  } catch (err) {
    return next(err);
  }
}

export default {
  listUserNotifications,
  deleteNotification,
  broadcast,
  deleteUserNotifications,
  getNotificationStats
};
