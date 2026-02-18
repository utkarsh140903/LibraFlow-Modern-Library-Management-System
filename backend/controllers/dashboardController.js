import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get Dashboard Stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
// @desc    Get Dashboard Stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        console.log("Fetching dashboard stats...");

        // 1. Total Books (Copies available + issued)
        // We are counting total documents in Book collection
        const totalBooks = await Book.countDocuments();

        // 2. Active Members
        const activeMembers = await Member.countDocuments({ status: 'Active' });

        // 3. Books Issued (Active transactions)
        const issuedBooks = await Transaction.countDocuments({ status: 'Issued' });

        // 4. Overdue Returns
        const today = new Date();
        const overdueReturns = await Transaction.countDocuments({
            status: 'Issued',
            dueDate: { $lt: today }
        });

        // 5. Recent Transactions (Limit 5)
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('book', 'name serialNo')
            .populate('member', 'firstName lastName memberId');

        // 5. Product Details (Category Ranges)
        // Required for the chart in frontend
        // We used MongoDB Aggregation Pipeline here because it's faster than looping in JS
        const productDetailsRaw = await Book.aggregate([
            {
                $group: {
                    _id: "$category",
                    codeNoFrom: { $min: "$serialNo" },
                    codeNoTo: { $max: "$serialNo" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedProductDetails = productDetailsRaw.map(item => ({
            category: item._id,
            codeNoFrom: item.codeNoFrom,
            codeNoTo: item.codeNoTo,
            count: item.count
        }));

        console.log("Dashboard stats fetched successfully");

        res.json({
            totalBooks,
            activeMembers,
            issuedBooks,
            overdueReturns,
            recentTransactions,
            productDetails: formattedProductDetails
        });
    } catch (error) {
        console.error("Error in dashboard stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { getDashboardStats };
