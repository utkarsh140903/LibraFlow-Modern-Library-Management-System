import express from 'express';
const router = express.Router();
import {
    getMembers,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
} from '../controllers/memberController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getMembers).post(protect, admin, addMember);
router
    .route('/:id')
    .get(protect, getMemberById)
    .put(protect, admin, updateMember)
    .delete(protect, admin, deleteMember);

export default router;
