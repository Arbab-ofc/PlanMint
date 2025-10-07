import Contact from "../models/Contact.js";
import Project from "../models/Project.js";



export async function createContact(req, res, next) {
  try {
    const { name, email, phone, tags, notes, projects /*, username */ } = req.body;

    
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const nameStr = String(name).trim();
    if (!nameStr || nameStr.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 120 characters"
      });
    }

    
    let emailStr;
    if (email) {
      emailStr = String(email).toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(emailStr)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
    }

    
    let phoneStr;
    if (phone) {
      phoneStr = String(phone).trim();
      if (phoneStr.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Phone number must not exceed 30 characters"
        });
      }
    }

   
    if (notes && String(notes).trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Notes must not exceed 10000 characters"
      });
    }

    
    const contactData = {
      name: nameStr,
      ownerId: req.userId,
      createdBy: req.userId
    };
    if (emailStr) contactData.email = emailStr;
    if (phoneStr) contactData.phone = phoneStr;
    if (Array.isArray(tags)) contactData.tags = tags;
    if (notes) contactData.notes = String(notes).trim();
    if (Array.isArray(projects)) contactData.projects = projects;
    

    const contact = new Contact(contactData);
    await contact.save();

    const populatedContact = await Contact.findById(contact._id)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: { contact: populatedContact }
    });

  } catch (err) {
    
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err?.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    
    return next(err);
  }
}



export async function getContact(req, res, next) {
  try {
    const { contactId } = req.params;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name description')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId._id) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this contact"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact retrieved successfully",
      data: {
        contact
      }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format"
      });
    }
    return next(err);
  }
}


export async function updateContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const { name, email, phone, notes } = req.body;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId);

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this contact"
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
      contact.name = nameStr;
    }

    
    if (email !== undefined) {
      if (email === null || email === '') {
        contact.email = undefined;
      } else {
        const emailStr = String(email).toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(emailStr)) {
          return res.status(400).json({
            success: false,
            message: "Invalid email format"
          });
        }

        
        const existingContact = await Contact.findOne({
          _id: { $ne: contactId },
          ownerId: req.userId,
          email: emailStr
        });

        if (existingContact) {
          return res.status(409).json({
            success: false,
            message: "Another contact with this email already exists"
          });
        }

        contact.email = emailStr;
      }
    }

    
    if (phone !== undefined) {
      if (phone === null || phone === '') {
        contact.phone = undefined;
      } else {
        const phoneStr = String(phone).trim();
        if (phoneStr.length > 30) {
          return res.status(400).json({
            success: false,
            message: "Phone number must not exceed 30 characters"
          });
        }

        
        const existingContact = await Contact.findOne({
          _id: { $ne: contactId },
          ownerId: req.userId,
          phone: phoneStr
        });

        if (existingContact) {
          return res.status(409).json({
            success: false,
            message: "Another contact with this phone number already exists"
          });
        }

        contact.phone = phoneStr;
      }
    }

    
    if (notes !== undefined) {
      if (notes === null || notes === '') {
        contact.notes = undefined;
      } else {
        const notesStr = String(notes).trim();
        if (notesStr.length > 10000) {
          return res.status(400).json({
            success: false,
            message: "Notes must not exceed 10000 characters"
          });
        }
        contact.notes = notesStr;
      }
    }

    
    contact.updatedBy = req.userId;

    
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: {
        contact: updatedContact
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
        message: "Invalid contact ID format"
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Contact with this email or phone already exists"
      });
    }

    return next(err);
  }
}


export async function listContacts(req, res, next) {
  try {
    const { page = 1, limit = 20, search, tags, archived } = req.query;

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = { ownerId: req.userId };

    
    if (archived === 'true') {
      filter.archivedAt = { $ne: null };
    } else {
      filter.archivedAt = null;
    }

    
    if (search) {
      const searchStr = String(search).trim();
      filter.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { email: { $regex: searchStr, $options: 'i' } }
      ];
    }

    
    if (tags) {
      const tagsArray = String(tags).split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagsArray };
    }

    
    const contacts = await Contact.find(filter)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    
    const totalContacts = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(totalContacts / limitNum);

    return res.status(200).json({
      success: true,
      message: "Contacts retrieved successfully",
      data: {
        contacts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalContacts,
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


export async function listProjectContacts(req, res, next) {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    
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

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = {
      ownerId: req.userId,
      projects: projectId,
      archivedAt: null
    };

    
    const contacts = await Contact.find(filter)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    
    const totalContacts = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(totalContacts / limitNum);

    return res.status(200).json({
      success: true,
      message: "Project contacts retrieved successfully",
      data: {
        contacts,
        project: {
          id: project._id,
          name: project.name
        },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalContacts,
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


export async function linkToProject(req, res, next) {
  try {
    const { contactId } = req.params;
    const { projectId } = req.body;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId);

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this contact"
      });
    }

    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    
    if (contact.projects.includes(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Contact is already linked to this project"
      });
    }

    
    contact.projects.push(projectId);
    contact.updatedBy = req.userId;
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Contact linked to project successfully",
      data: {
        contact: updatedContact
      }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    return next(err);
  }
}


export async function unlinkFromProject(req, res, next) {
  try {
    const { contactId, projectId } = req.params;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId);

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this contact"
      });
    }

    
    if (!contact.projects.includes(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Contact is not linked to this project"
      });
    }

   
    contact.projects = contact.projects.filter(
      p => String(p) !== String(projectId)
    );
    contact.updatedBy = req.userId;
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Contact unlinked from project successfully",
      data: {
        contact: updatedContact
      }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    return next(err);
  }
}


export async function updateTags(req, res, next) {
  try {
    const { contactId } = req.params;
    const { tags } = req.body;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array"
      });
    }

    
    const contact = await Contact.findById(contactId);

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this contact"
      });
    }

    
    contact.tags = tags;
    contact.updatedBy = req.userId;
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Contact tags updated successfully",
      data: {
        contact: updatedContact
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
        message: "Invalid contact ID format"
      });
    }
    return next(err);
  }
}


export async function deleteContact(req, res, next) {
  try {
    const { contactId } = req.params;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId);

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    if (String(contact.ownerId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this contact"
      });
    }

    
    await Contact.findByIdAndDelete(contactId);

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: {
        contactId,
        contactName: contact.name
      }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format"
      });
    }
    return next(err);
  }
}

export default {
  createContact,
  getContact,
  updateContact,
  listContacts,
  listProjectContacts,
  linkToProject,
  unlinkFromProject,
  updateTags,
  deleteContact
};
