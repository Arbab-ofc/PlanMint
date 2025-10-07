import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";


export async function createTask(req, res, next) {
  try {
    const { projectId, title, description, assigneeUsername, status, priority, dueDate, labels } = req.body;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    
    const titleStr = String(title).trim();
    if (!titleStr || titleStr.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 1 and 200 characters"
      });
    }

    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    
    const taskData = {
      projectId,
      title: titleStr,
      createdBy: req.userId
    };

    
    if (description !== undefined) {
      const descStr = String(description).trim();
      if (descStr.length > 20000) {
        return res.status(400).json({
          success: false,
          message: "Description must not exceed 20000 characters"
        });
      }
      taskData.description = descStr;
    }

    
    if (assigneeUsername) {
      taskData.assigneeUsername = String(assigneeUsername).toLowerCase().trim();
    }

    
    if (status && ['Todo', 'In-Progress', 'Done'].includes(status)) {
      taskData.status = status;
    }

    
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      taskData.priority = priority;
    }

    
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    
    if (labels && Array.isArray(labels)) {
      taskData.labels = labels;
    }

    
    const task = new Task(taskData);
    await task.save();

    
    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task: populatedTask
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    return next(err);
  }
}


export async function getTask(req, res, next) {
  try {
    const { taskId } = req.params;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    const task = await Task.findById(taskId)
      .populate('projectId', 'name description')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('statusHistory.by', 'username email name');

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: {
        task
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function updateTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { title, description } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    if (title !== undefined) {
      const titleStr = String(title).trim();
      if (!titleStr || titleStr.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 1 and 200 characters"
        });
      }
      task.title = titleStr;
    }

    
    if (description !== undefined) {
      const descStr = String(description).trim();
      if (descStr.length > 20000) {
        return res.status(400).json({
          success: false,
          message: "Description must not exceed 20000 characters"
        });
      }
      task.description = descStr;
    }

    
    task.updatedBy = req.userId;

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task: updatedTask
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function deleteTask(req, res, next) {
  try {
    const { taskId } = req.params;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    await Task.findByIdAndDelete(taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: {
        taskId,
        taskTitle: task.title
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function listProjectTasks(req, res, next) {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, priority, assigneeUsername, search } = req.query;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = { projectId };

    
    if (status && ['Todo', 'In-Progress', 'Done'].includes(status)) {
      filter.status = status;
    }

    
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    
    if (assigneeUsername) {
      filter.assigneeUsername = String(assigneeUsername).toLowerCase().trim();
    }

    
    if (search) {
      const searchStr = String(search).trim();
      filter.$or = [
        { title: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } }
      ];
    }

    
    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / limitNum);

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        tasks,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTasks,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format"
      });
    }
    return next(err);
  }
}


export async function changeStatus(req, res, next) {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    
    if (!['Todo', 'In-Progress', 'Done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: Todo, In-Progress, Done"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    const oldStatus = task.status;

    
    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Task is already in ${status} status`
      });
    }

    
    
    task.status = status;
    task.lastStatusChangedAt = new Date();
    task.updatedBy = req.userId;

    
    const historyEntry = {
      from: oldStatus,
      to: status,
      at: new Date(),
      by: req.userId
    };

    if (!task.statusHistory) {
      task.statusHistory = [];
    }
    task.statusHistory.push(historyEntry);

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('statusHistory.by', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Task status changed from ${oldStatus} to ${status} successfully`,
      data: {
        task: updatedTask,
        oldStatus,
        newStatus: status
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function reassignTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { assigneeUsername } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    if (!assigneeUsername) {
      return res.status(400).json({
        success: false,
        message: "Assignee username is required"
      });
    }

    const usernameStr = String(assigneeUsername).toLowerCase().trim();

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    const user = await User.findOne({ username: usernameStr });

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with username "${usernameStr}" not found`
      });
    }

    
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const isMember = project.members.some(m => 
      String(m.user) === String(user._id) || m.username === usernameStr
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this project"
      });
    }

    
    if (task.assigneeUsername === usernameStr) {
      return res.status(400).json({
        success: false,
        message: "Task is already assigned to this user"
      });
    }

    
    const oldAssignee = task.assigneeUsername;

    
    
    task.assigneeUsername = usernameStr;
    task.assigneeId = user._id;
    task.updatedBy = req.userId;

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Task reassigned to ${usernameStr} successfully`,
      data: {
        task: updatedTask,
        oldAssignee: oldAssignee || null,
        newAssignee: usernameStr
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function updateLabels(req, res, next) {
  try {
    const { taskId } = req.params;
    const { labels } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({
        success: false,
        message: "Labels must be an array"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    
    task.labels = labels;
    task.updatedBy = req.userId;

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Task labels updated successfully",
      data: {
        task: updatedTask
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function updateDueDate(req, res, next) {
  try {
    const { taskId } = req.params;
    const { dueDate } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    
    if (dueDate === null || dueDate === undefined || dueDate === '') {
      task.dueDate = undefined;
    } else {
      task.dueDate = new Date(dueDate);
    }
    task.updatedBy = req.userId;

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Task due date updated successfully",
      data: {
        task: updatedTask
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}


export async function updatePriority(req, res, next) {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required"
      });
    }

    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be one of: low, medium, high"
      });
    }

    
    const task = await Task.findById(taskId);

    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    
    const oldPriority = task.priority;

    
    if (oldPriority === priority) {
      return res.status(400).json({
        success: false,
        message: `Task priority is already set to ${priority}`
      });
    }

    
    
    task.priority = priority;
    task.updatedBy = req.userId;

    
    await task.save();

    
    const updatedTask = await Task.findById(taskId)
      .populate('projectId', 'name')
      .populate('assigneeId', 'username email name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Task priority changed from ${oldPriority} to ${priority} successfully`,
      data: {
        task: updatedTask,
        oldPriority,
        newPriority: priority
      }
    });

  } catch (err) {
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }
    return next(err);
  }
}

export async function updateProjectStatus(req, res, next) {
  try {
    const { projectId } = req.params;
    let { status } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    status = String(status).toLowerCase().trim();
    const ALLOWED = ["pending", "done", "failed"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: pending, done, failed",
      });
    }

    // Fetch minimal fields to compute permissions
    const project = await Project.findById(projectId, {
      _id: 1,
      createdBy: 1,
      members: 1,
      projectStatus: 1,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const uid = String(req.userId || "");
    const isOwner =
      (project.createdBy && String(project.createdBy) === uid) ||
      (Array.isArray(project.members) &&
        project.members.some(
          (m) =>
            (String(m.user || m.userId || "") === uid) && m.role === "owner"
        ));

    const isAdmin =
      Array.isArray(project.members) &&
      project.members.some(
        (m) =>
          (String(m.user || m.userId || "") === uid) && m.role === "admin"
      );

    if (!(isOwner || isAdmin)) {
      return res.status(403).json({
        success: false,
        message: "Only project owner or admin can change project status",
      });
    }

    const oldStatus = project.projectStatus;
    project.projectStatus = status;
    await project.save();

    return res.status(200).json({
      success: true,
      message: `Project status updated from "${oldStatus || "pending"}" to "${status}"`,
      data: {
        projectId: project._id,
        oldStatus: oldStatus || null,
        newStatus: project.projectStatus,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export default { 
  createTask, 
  getTask, 
  updateTask, 
  deleteTask, 
  listProjectTasks, 
  changeStatus, 
  reassignTask, 
  updateLabels, 
  updateDueDate, 
  updatePriority,
  updateProjectStatus
};
