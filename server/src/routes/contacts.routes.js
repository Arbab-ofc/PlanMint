import express from 'express';
import {
  createContact,
  getContact,
  updateContact,
  listContacts,
  listProjectContacts,
  linkToProject,
  unlinkFromProject,
  updateTags,
  deleteContact
} from '../controllers/contacts.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);


router.post('/contacts', createContact);


router.get('/contacts', listContacts);


router.get('/contacts/:contactId', getContact);


router.put('/contacts/:contactId', updateContact);


router.delete('/contacts/:contactId', deleteContact);


router.get('/projects/:projectId/contacts', listProjectContacts);


router.post('/contacts/:contactId/link-project', linkToProject);


router.delete('/contacts/:contactId/projects/:projectId', unlinkFromProject);


router.patch('/contacts/:contactId/tags', updateTags);

export default router;
