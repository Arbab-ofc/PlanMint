import Contact from "../models/Contact.js";
import User from "../models/User.js";
import Project from "../models/Project.js";


export async function adminListContacts(req, res, next) {
  try {
    const { page = 1, limit = 20, search, tags, archived, ownerId } = req.query;

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const filter = {};

    
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    
    if (archived === 'true') {
      filter.archivedAt = { $ne: null };
    } else if (archived === 'false') {
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
      .populate('ownerId', 'username email name role')
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


export async function adminGetContact(req, res, next) {
  try {
    const { contactId } = req.params;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    const contact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name role')
      .populate('projects', 'name description')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
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


export async function adminUpdateContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const { name, email, phone, notes, tags, archivedAt } = req.body;

    
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
          ownerId: contact.ownerId,
          email: emailStr
        });

        if (existingContact) {
          return res.status(409).json({
            success: false,
            message: "Another contact with this email already exists for this owner"
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
          ownerId: contact.ownerId,
          phone: phoneStr
        });

        if (existingContact) {
          return res.status(409).json({
            success: false,
            message: "Another contact with this phone number already exists for this owner"
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

    
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array"
        });
      }
      contact.tags = tags;
    }

    
    if (archivedAt !== undefined) {
      if (archivedAt === null || archivedAt === '') {
        contact.archivedAt = undefined;
      } else {
        contact.archivedAt = new Date(archivedAt);
      }
    }

    
    contact.updatedBy = req.userId;

   
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name role')
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
        message: "Contact with this email or phone already exists for this owner"
      });
    }

    return next(err);
  }
}


export async function adminReassignOwner(req, res, next) {
  try {
    const { contactId } = req.params;
    const { newOwnerUsername } = req.body;

    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    
    if (!newOwnerUsername) {
      return res.status(400).json({
        success: false,
        message: "New owner username is required"
      });
    }

    const usernameStr = String(newOwnerUsername).toLowerCase().trim();

    
    const contact = await Contact.findById(contactId);

   
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    
    const newOwner = await User.findOne({ username: usernameStr });

    
    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: `User with username "${usernameStr}" not found`
      });
    }

    
    if (String(contact.ownerId) === String(newOwner._id)) {
      return res.status(400).json({
        success: false,
        message: "Contact is already owned by this user"
      });
    }

    
    if (contact.email) {
      const existingContact = await Contact.findOne({
        ownerId: newOwner._id,
        email: contact.email
      });

      if (existingContact) {
        return res.status(409).json({
          success: false,
          message: "New owner already has a contact with this email"
        });
      }
    }

    if (contact.phone) {
      const existingContact = await Contact.findOne({
        ownerId: newOwner._id,
        phone: contact.phone
      });

      if (existingContact) {
        return res.status(409).json({
          success: false,
          message: "New owner already has a contact with this phone number"
        });
      }
    }

    
    const oldOwner = await User.findById(contact.ownerId);
    const oldOwnerUsername = oldOwner ? oldOwner.username : 'unknown';

    
    contact.ownerId = newOwner._id;
    contact.updatedBy = req.userId;
    await contact.save();

    
    const updatedContact = await Contact.findById(contactId)
      .populate('ownerId', 'username email name role')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: `Contact ownership transferred from ${oldOwnerUsername} to ${usernameStr}`,
      data: {
        contact: updatedContact,
        oldOwner: oldOwnerUsername,
        newOwner: usernameStr
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
        message: "New owner already has a contact with this email or phone"
      });
    }

    return next(err);
  }
}


export async function adminDeleteContact(req, res, next) {
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

    
    const contactInfo = {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      ownerId: contact.ownerId
    };

    
    await Contact.findByIdAndDelete(contactId);

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: {
        contactId: contactInfo.id,
        contactName: contactInfo.name,
        contactEmail: contactInfo.email
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


export async function adminLinkToProject(req, res, next) {
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
      .populate('ownerId', 'username email name role')
      .populate('projects', 'name')
      .populate('createdBy', 'username email name')
      .populate('updatedBy', 'username email name');

    return res.status(200).json({
      success: true,
      message: "Contact linked to project successfully",
      data: {
        contact: updatedContact,
        project: {
          id: project._id,
          name: project.name
        }
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


export async function adminSearchContactsGlobal(req, res, next) {
  try {
    const { query, limit = 10 } = req.query;

    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const searchStr = String(query).trim();
    const limitNum = parseInt(limit, 10);

    
    const filter = {
      $or: [
        { name: { $regex: searchStr, $options: 'i' } },
        { email: { $regex: searchStr, $options: 'i' } },
        { phone: { $regex: searchStr, $options: 'i' } }
      ],
      archivedAt: null 
    };

    
    const contacts = await Contact.find(filter)
      .populate('ownerId', 'username email name role')
      .populate('projects', 'name')
      .sort({ name: 1 })
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Contacts search completed",
      data: {
        contacts,
        query: searchStr,
        count: contacts.length
      }
    });

  } catch (err) {
    return next(err);
  }
}

export default {
  adminListContacts,
  adminGetContact,
  adminUpdateContact,
  adminReassignOwner,
  adminDeleteContact,
  adminLinkToProject,
  adminSearchContactsGlobal
};
