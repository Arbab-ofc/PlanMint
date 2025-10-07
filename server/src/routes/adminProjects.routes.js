import express from 'express';
import { 
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
} from '../controllers/adminProjects.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);
router.use(requireAdmin);


router.get('/projects/search', searchProjectsGlobal);


router.get('/projects', listProjects);


router.get('/projects/:projectId', getProject);


router.put('/projects/:projectId', updateProjectMeta);


router.patch('/projects/:projectId/transfer-ownership', transferOwnership);


router.post('/projects/:projectId/members', addMemberByUsername);


router.patch('/projects/:projectId/members/:username/role', changeMemberRole);


router.delete('/projects/:projectId/members/:username', removeMember);


router.delete('/projects/:projectId', deleteProject);

router.get('/projects/:projectId/status', getProjectStatus);
router.patch('/projects/:projectId/status', updateProjectStatus);

export default router;
