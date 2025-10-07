import express from 'express';
import {
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
} from '../controllers/projects.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);


router.get('/search', searchProjects);


router.get('/', listMyProjects);


router.post('/', createProject);


router.get('/:projectId', getProject);


router.put('/:projectId', updateProject);


router.delete('/:projectId', deleteProject);


router.get('/:projectId/members', listMembers);


router.post('/:projectId/members', addMemberByUsername);


router.patch('/:projectId/members/:username/role', changeMemberRole);


router.delete('/:projectId/members/:username', removeMember);


router.post('/:projectId/leave', leaveProject);


router.patch('/:projectId/transfer-ownership', transferOwnership);

export default router;
