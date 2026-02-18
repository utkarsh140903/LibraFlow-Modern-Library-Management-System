import express from 'express';
const router = express.Router();
import {
    getMasterListBooks,
    getMasterListMovies,
    getMasterListMemberships,
    getActiveIssues,
    getOverdueReturns,
    getIssueRequests
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/books', protect, admin, getMasterListBooks);
router.get('/movies', protect, admin, getMasterListMovies);
router.get('/memberships', protect, admin, getMasterListMemberships);
router.get('/active-issues', protect, admin, getActiveIssues);
router.get('/overdue-returns', protect, admin, getOverdueReturns);
router.get('/issue-requests', protect, admin, getIssueRequests);

export default router;
