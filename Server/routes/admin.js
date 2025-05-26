import express from 'express';
import { createUser, updateUser, deleteUser, getUsers } from '../controllers/admin.js';
import { auth, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Superadmin routes
router.post(
  '/',
  auth,
  restrictTo('create_admin', 'create_subadmin'),
  createUser
);
router.put(
  '/:id',
  auth,
  restrictTo('update_admin', 'update_subadmin'),
  updateUser
);
router.delete(
  '/:id',
  auth,
  restrictTo('delete_admin', 'delete_subadmin'),
  deleteUser
);
router.get('/', auth, restrictTo('view_users'), getUsers);

export default router;