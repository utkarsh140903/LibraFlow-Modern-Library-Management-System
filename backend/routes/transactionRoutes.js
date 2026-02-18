import express from 'express';
const router = express.Router();
import {
    issueBook,
    returnBook,
    payFine,
    getTransactions,
    getActiveTransaction,
    checkAvailability,
    payMemberFine
} from '../controllers/transactionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getTransactions);
router.post('/issue', protect, issueBook);
router.post('/return', protect, returnBook);
router.get('/details', protect, getActiveTransaction);
router.get('/availability', protect, checkAvailability); // New
router.post('/pay-fine-member', protect, payMemberFine); // New
router.put('/pay-fine/:id', protect, admin, payFine);

export default router;
