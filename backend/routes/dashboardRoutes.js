import express from 'express';
const router = express.Router();
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Allow users to see product details too
router.get('/stats', protect, getDashboardStats);

export default router;
