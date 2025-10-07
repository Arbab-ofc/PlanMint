import Project from "../models/Project.js";
import User from "../models/User.js";


export async function listProjects(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '', archived = '' } = req.query;

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = {};

    
    if (search) {
      const searchStr = String(search).trim();
      filter.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } }
      ];
    }

    
    if (archived === 'true') {
      filter.archivedAt = { $ne: null };
    } else if (archived === 'false') {
      filter.archivedAt = null;
    }

    
    const projects = await Project.find(filter)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('members.user', 'username email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    
    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / limitNum);

    return res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: {
        projects,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProjects,
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


export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('members.user', 'username email name')
      .populate('members.addedBy', 'username email name');

    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
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
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format"
      });
    }
    return next(err);
  }
}


export async function updateProjectMeta(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, description, startDate, endDate } = req.body;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const project = await Project.findById(projectId);

    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    if (name !== undefined) {
      const nameStr = String(name).trim();
      if (!nameStr || nameStr.length > 120) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 1 and 120 characters"
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

    
    await project.save();

    
    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .populate('members.user', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Project metadata updated successfully",
      data: {
        project: updatedProject
      }
    });

  } catch (err) {
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format"
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


export async function transferOwnership(req, res, next) {
  try {
    const { projectId } = req.params;
    const { newOwnerUsername } = req.body;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    if (!newOwnerUsername) {
      return res.status(400).json({
        success: false,
        message: "New owner username is required"
      });
    }

    const usernameStr = String(newOwnerUsername).toLowerCase().trim();

    
    const project = await Project.findById(projectId);

    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const newOwner = await User.findOne({ username: usernameStr });

    
    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: `User with username "${usernameStr}" not found`
      });
    }

    
    const currentOwner = project.members.find(m => m.role === 'owner');
    if (currentOwner && currentOwner.username === usernameStr) {
      return res.status(400).json({
        success: false,
        message: "User is already the owner of this project"
      });
    }

    
    if (currentOwner) {
      currentOwner.role = 'admin';
    }

    
    const memberIndex = project.members.findIndex(m => m.username === usernameStr);
    if (memberIndex !== -1) {
      project.members[memberIndex].role = 'owner';
    } else {
      project.members.push({
        user: newOwner._id,
        username: usernameStr,
        role: 'owner',
        addedBy: project.createdBy
      });
    }

    
    project.createdBy = newOwner._id;
    await project.save();

    
    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Project ownership transferred to ${usernameStr} successfully`,
      data: {
        project: updatedProject,
        oldOwner: currentOwner ? currentOwner.username : null,
        newOwner: usernameStr
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


export async function addMemberByUsername(req, res, next) {
  try {
    const { projectId } = req.params;
    const { username, role = 'member' } = req.body;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required"
      });
    }

    
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'member'"
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

    
    const user = await User.findOne({ username: usernameStr });

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with username "${usernameStr}" not found`
      });
    }

    
    const existingMember = project.members.find(m => m.username === usernameStr);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project"
      });
    }

    
    project.members.push({
      user: user._id,
      username: usernameStr,
      role: role,
      addedBy: project.createdBy
    });

    await project.save();

    
    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name');

    return res.status(200).json({
      success: true,
      message: `User ${usernameStr} added to project successfully`,
      data: {
        project: updatedProject
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


export async function changeMemberRole(req, res, next) {
  try {
    const { projectId, username } = req.params;
    const { role } = req.body;

    
    if (!projectId || !username) {
      return res.status(400).json({
        success: false,
        message: "Project ID and username are required"
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

    const usernameStr = String(username).toLowerCase().trim();

    
    const project = await Project.findById(projectId);

    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    const member = project.members.find(m => m.username === usernameStr);

    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: `User ${usernameStr} is not a member of this project`
      });
    }

    
    if (member.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: "Cannot change role of project owner. Use transfer ownership instead."
      });
    }

    
    if (member.role === role) {
      return res.status(400).json({
        success: false,
        message: `User is already a ${role}`
      });
    }

    
    const oldRole = member.role;
    member.role = role;
    await project.save();

    
    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Member role changed from ${oldRole} to ${role} successfully`,
      data: {
        project: updatedProject,
        username: usernameStr,
        oldRole,
        newRole: role
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


export async function removeMember(req, res, next) {
  try {
    const { projectId, username } = req.params;

    
    if (!projectId || !username) {
      return res.status(400).json({
        success: false,
        message: "Project ID and username are required"
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

    
    const memberIndex = project.members.findIndex(m => m.username === usernameStr);

    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User ${usernameStr} is not a member of this project`
      });
    }

    
    if (project.members[memberIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: "Cannot remove project owner. Transfer ownership first."
      });
    }

    
    project.members.splice(memberIndex, 1);
    await project.save();

    
    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name');

    return res.status(200).json({
      success: true,
      message: `User ${usernameStr} removed from project successfully`,
      data: {
        project: updatedProject
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


export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;

    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const project = await Project.findById(projectId);

    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {
        projectId,
        projectName: project.name
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


export async function searchProjectsGlobal(req, res, next) {
  try {
    const { query, limit = 20 } = req.query;

    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const searchStr = String(query).trim();
    const limitNum = parseInt(limit, 10);

    
    const projects = await Project.find({
      $or: [
        { name: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
        { 'members.username': { $regex: searchStr, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'username email name')
      .populate('members.user', 'username email name')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        query: searchStr,
        count: projects.length,
        projects
      }
    });

  } catch (err) {
    return next(err);
  }
}

export async function getProjectStatus(req, res, next) {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    const project = await Project.findById(projectId).select("projectStatus name");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project status retrieved successfully",
      data: {
        projectId,
        name: project.name,
        status: project.projectStatus,
        allowed: Project.schema.path("projectStatus").enumValues 
      }
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format"
      });
    }
    return next(err);
  }
}


export async function updateProjectStatus(req, res, next) {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // validate against enum in schema
    const allowed = Project.schema.path("projectStatus").enumValues;
    if (!allowed.includes(String(status))) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    project.projectStatus = status;
    if (req.user && (req.user._id || req.user.id)) {
      project.updatedBy = req.user._id || req.user.id;
    }

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("createdBy", "username email name")
      .populate("updatedBy", "username email name")
      .populate("members.user", "username email name");

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully",
      data: {
        project: updatedProject,
        status: updatedProject.projectStatus,
        allowed
      }
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format"
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return next(err);
  }
}

export default { 
  listProjects, 
  getProject, 
  updateProjectMeta, 
  transferOwnership, 
  addMemberByUsername, 
  changeMemberRole, 
  removeMember, 
  deleteProject, 
  searchProjectsGlobal,
  getProjectStatus,
  updateProjectStatus, 
};
