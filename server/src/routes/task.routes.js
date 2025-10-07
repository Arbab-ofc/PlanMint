import express from 'express';
import { 
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
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);


router.post('/tasks', createTask);


router.get('/tasks/:taskId', getTask);


router.put('/tasks/:taskId', updateTask);


router.delete('/tasks/:taskId', deleteTask);


router.get('/projects/:projectId/tasks', listProjectTasks);


router.patch('/tasks/:taskId/status', changeStatus);


router.patch('/tasks/:taskId/reassign', reassignTask);


router.patch('/tasks/:taskId/labels', updateLabels);


router.patch('/tasks/:taskId/due-date', updateDueDate);


router.patch('/tasks/:taskId/priority', updatePriority);

router.patch("/projects/:projectId/status", updateProjectStatus);

export default router;
