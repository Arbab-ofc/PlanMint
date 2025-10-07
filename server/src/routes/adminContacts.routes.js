import express from 'express';
import {
  adminListContacts,
  adminGetContact,
  adminUpdateContact,
  adminReassignOwner,
  adminDeleteContact,
  adminLinkToProject,
  adminSearchContactsGlobal
} from '../controllers/adminContacts.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);
router.use(requireAdmin);


router.get('/contacts/search', adminSearchContactsGlobal);


router.get('/contacts', adminListContacts);


router.get('/contacts/:contactId', adminGetContact);


router.put('/contacts/:contactId', adminUpdateContact);


router.patch('/contacts/:contactId/reassign-owner', adminReassignOwner);


router.post('/contacts/:contactId/link-project', adminLinkToProject);


router.delete('/contacts/:contactId', adminDeleteContact);

export default router;
