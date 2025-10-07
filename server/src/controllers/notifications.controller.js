import Notification from "../models/Notification.js";


export async function listNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly, type } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    
    const query = {
      userId: req.userId
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
      userId: req.userId,
      readAt: null
    });

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
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


export async function unreadCount(req, res, next) {
  try {
    
    const count = await Notification.countDocuments({
      userId: req.userId,
      readAt: null
    });

    return res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully",
      data: {
        unreadCount: count
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function markRead(req, res, next) {
  try {
    const { notificationId } = req.params;

    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    
    if (String(notification.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this notification"
      });
    }

    
    if (notification.readAt) {
      return res.status(400).json({
        success: false,
        message: "Notification is already marked as read"
      });
    }

    
    notification.readAt = new Date();
    await notification.save();

    
    await notification.populate([
      { path: 'userId', select: 'username email name avatarUrl' },
      { path: 'ref.projectId', select: 'name' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function markAllRead(req, res, next) {
  try {
    
    const result = await Notification.updateMany(
      {
        userId: req.userId,
        readAt: null
      },
      {
        $set: { readAt: new Date() }
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function deleteNotification(req, res, next) {
  try {
    const { notificationId } = req.params;

    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    
    if (String(notification.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this notification"
      });
    }

    
    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: {
        notificationId
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function deleteAllRead(req, res, next) {
  try {
    
    const result = await Notification.deleteMany({
      userId: req.userId,
      readAt: { $ne: null }
    });

    return res.status(200).json({
      success: true,
      message: "All read notifications deleted successfully",
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (err) {
    return next(err);
  }
}

export default {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllRead
};
