import express from 'express';
const router = express.Router();
import {
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    getBookBySerial
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getBooks).post(protect, admin, addBook);
router.route('/serial/:serialNo').get(protect, getBookBySerial);
router
    .route('/:id')
    .put(protect, admin, updateBook)
    .delete(protect, admin, deleteBook);

export default router;
