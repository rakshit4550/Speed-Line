import express from 'express';
import { createRole, updateRole, deleteRole, getRoles } from '../controllers/role.js';
import { auth, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, restrictTo('create_role'), createRole);
router.put('/:id', auth, restrictTo('update_role'), updateRole);
router.delete('/:id', auth, restrictTo('delete_role'), deleteRole);
router.get('/', auth, getRoles);

export default router;