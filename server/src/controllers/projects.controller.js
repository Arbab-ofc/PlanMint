import Project from "../models/Project.js";
import User from "../models/User.js";


export async function createProject(req, res, next) {
  try {
    const { name, description, startDate, endDate, members } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }

    const nameStr = String(name).trim();
    if (!nameStr || nameStr.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Project name must be between 1 and 120 characters"
      });
    }

    
    if (description !== undefined) {
      const descStr = String(description).trim();
      if (descStr.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Description must not exceed 5000 characters"
        });
      }
    }

    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date"
        });
      }
    }

    const projectData = {
      name: nameStr,
      description: description ? String(description).trim() : '',
      createdBy: req.userId,
      updatedBy: req.userId,
      members: []
    };

    if (startDate) projectData.startDate = new Date(startDate);
    if (endDate) projectData.endDate = new Date(endDate);

    if (members && Array.isArray(members)) {
      for (const member of members) {
        if (member.username) {
          const username = String(member.username).toLowerCase().trim();
          
          const creator = await User.findById(req.userId).select('username');
          if (creator && username === creator.username) continue;

          projectData.members.push({
            username: username,
            role: member.role || 'member',
            addedBy: req.userId
          });
        }
      }
    }

    
    const project = new Project(projectData);
    await project.save();

    
    await project.populate([
      { path: 'createdBy', select: 'username email name' },
      { path: 'updatedBy', select: 'username email name' },
      { path: 'members.user', select: 'username email name avatarUrl' },
      { path: 'members.addedBy', select: 'username email name' }
    ]);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project
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


export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('members.user', 'username email name avatarUrl')
      .populate('members.addedBy', 'username email name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const isMember = project.members.some(
      m => m.user && String(m.user._id) === String(req.userId)
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: {
        project
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function updateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, description, startDate, endDate, archivedAt } = req.body;

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const member = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Only project owner or admin can update project details"
      });
    }

    
    if (name !== undefined) {
      const nameStr = String(name).trim();
      if (!nameStr || nameStr.length > 120) {
        return res.status(400).json({
          success: false,
          message: "Project name must be between 1 and 120 characters"
        });
      }
      project.name = nameStr;
    }

    
    if (description !== undefined) {
      const descStr = String(description).trim();
      if (descStr.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Description must not exceed 5000 characters"
        });
      }
      project.description = descStr;
    }

   
    if (startDate !== undefined) {
      project.startDate = startDate ? new Date(startDate) : undefined;
    }

    if (endDate !== undefined) {
      project.endDate = endDate ? new Date(endDate) : undefined;
    }

    
    if (project.startDate && project.endDate && project.endDate < project.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    
    if (archivedAt !== undefined && member.role === 'owner') {
      project.archivedAt = archivedAt ? new Date(archivedAt) : undefined;
    }

    
    project.updatedBy = req.userId;

   
    await project.save();

    
    await project.populate([
      { path: 'createdBy', select: 'username email name' },
      { path: 'updatedBy', select: 'username email name' },
      { path: 'members.user', select: 'username email name avatarUrl' },
      { path: 'members.addedBy', select: 'username email name' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project
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


export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const member = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!member || member.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete the project"
      });
    }

    
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {
        projectId
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function listMyProjects(req, res, next) {
  try {
    const { page = 1, limit = 20, archived, search } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    
    const query = {
      'members.user': req.userId
    };

    
    if (archived === 'true') {
      query.archivedAt = { $ne: null };
    } else if (archived === 'false') {
      query.archivedAt = null;
    }

    
    if (search) {
      const searchStr = String(search).trim();
      if (searchStr) {
        query.$or = [
          { name: { $regex: searchStr, $options: 'i' } },
          { description: { $regex: searchStr, $options: 'i' } }
        ];
      }
    }

    
    const total = await Project.countDocuments(query);

    
    const projects = await Project.find(query)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('members.user', 'username email name avatarUrl')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: {
        projects,
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


export async function searchProjects(req, res, next) {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const limitNum = parseInt(limit, 10);
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50"
      });
    }

    const searchStr = String(query).trim();

    
    const projects = await Project.find({
      'members.user': req.userId,
      archivedAt: null,
      $or: [
        { name: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name avatarUrl')
      .select('name description members createdBy createdAt')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        projects,
        count: projects.length
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function listMembers(req, res, next) {
  try {
    const { projectId } = req.params;

    
    const project = await Project.findById(projectId)
      .populate('members.user', 'username email name avatarUrl')
      .populate('members.addedBy', 'username email name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const isMember = project.members.some(
      m => m.user && String(m.user._id) === String(req.userId)
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: {
        members: project.members,
        count: project.members.length
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function addMemberByUsername(req, res, next) {
  try {
    const { projectId } = req.params;
    const { username, role = 'member' } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required"
      });
    }

    
    const validRoles = ['member', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'member' or 'admin'"
      });
    }

    const usernameStr = String(username).toLowerCase().trim();

   
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const requester = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Only project owner or admin can add members"
      });
    }

    
    const userToAdd = await User.findOne({ username: usernameStr });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    const existingMember = project.members.find(
      m => m.username === usernameStr || (m.user && String(m.user) === String(userToAdd._id))
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project"
      });
    }

    
    project.members.push({
      username: usernameStr,
      user: userToAdd._id,
      role: role,
      addedBy: req.userId,
      addedAt: new Date()
    });

    project.updatedBy = req.userId;
    await project.save();

    
    await project.populate([
      { path: 'members.user', select: 'username email name avatarUrl' },
      { path: 'members.addedBy', select: 'username email name' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: {
        project,
        addedMember: project.members[project.members.length - 1]
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


export async function changeMemberRole(req, res, next) {
  try {
    const { projectId, username } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    
    const validRoles = ['member', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'member' or 'admin'"
      });
    }

    const usernameStr = String(username).toLowerCase().trim();

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const requester = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: "Only project owner can change member roles"
      });
    }

    
    const memberIndex = project.members.findIndex(
      m => m.username === usernameStr
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project"
      });
    }

    
    if (project.members[memberIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: "Cannot change owner's role. Use transfer ownership instead"
      });
    }

    
    project.members[memberIndex].role = role;
    project.updatedBy = req.userId;
    await project.save();

    
    await project.populate([
      { path: 'members.user', select: 'username email name avatarUrl' },
      { path: 'members.addedBy', select: 'username email name' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: {
        project,
        updatedMember: project.members[memberIndex]
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function removeMember(req, res, next) {
  try {
    const { projectId, username } = req.params;

    const usernameStr = String(username).toLowerCase().trim();

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const requester = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Only project owner or admin can remove members"
      });
    }

    
    const memberIndex = project.members.findIndex(
      m => m.username === usernameStr
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project"
      });
    }

    
    if (project.members[memberIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: "Cannot remove project owner. Transfer ownership first"
      });
    }

    
    if (requester.role === 'admin' && project.members[memberIndex].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only project owner can remove admins"
      });
    }

    
    const removedMember = project.members[memberIndex];
    project.members.splice(memberIndex, 1);
    project.updatedBy = req.userId;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: {
        removedMember: {
          username: removedMember.username,
          role: removedMember.role
        }
      }
    });

  } catch (err) {
    return next(err);
  }
}


export async function leaveProject(req, res, next) {
  try {
    const { projectId } = req.params;

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const memberIndex = project.members.findIndex(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this project"
      });
    }

    
    if (project.members[memberIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: "Project owner cannot leave. Transfer ownership first or delete the project"
      });
    }

    
    project.members.splice(memberIndex, 1);
    project.updatedBy = req.userId;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "You have left the project successfully"
    });

  } catch (err) {
    return next(err);
  }
}


export async function transferOwnership(req, res, next) {
  try {
    const { projectId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "New owner username is required"
      });
    }

    const usernameStr = String(username).toLowerCase().trim();

    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const requester = project.members.find(
      m => m.user && String(m.user) === String(req.userId)
    );

    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: "Only project owner can transfer ownership"
      });
    }

    
    const newOwnerIndex = project.members.findIndex(
      m => m.username === usernameStr
    );

    if (newOwnerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "New owner must be a member of the project"
      });
    }

    
    if (project.members[newOwnerIndex].user && String(project.members[newOwnerIndex].user) === String(req.userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already the owner"
      });
    }

    
    const currentOwnerIndex = project.members.findIndex(
      m => m.user && String(m.user) === String(req.userId)
    );
    project.members[currentOwnerIndex].role = 'admin';

    
    project.members[newOwnerIndex].role = 'owner';

    
    project.createdBy = project.members[newOwnerIndex].user;
    project.updatedBy = req.userId;

    await project.save();

    
    await project.populate([
      { path: 'createdBy', select: 'username email name' },
      { path: 'updatedBy', select: 'username email name' },
      { path: 'members.user', select: 'username email name avatarUrl' },
      { path: 'members.addedBy', select: 'username email name' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Ownership transferred successfully",
      data: {
        project,
        newOwner: project.members[newOwnerIndex],
        previousOwner: project.members[currentOwnerIndex]
      }
    });

  } catch (err) {
    return next(err);
  }
}

export default {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listMyProjects,
  searchProjects,
  listMembers,
  addMemberByUsername,
  changeMemberRole,
  removeMember,
  leaveProject,
  transferOwnership
};
