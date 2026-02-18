import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get Master List of Books
// @route   GET /api/reports/books
// @access  Private/Admin
const getMasterListBooks = asyncHandler(async (req, res) => {
    // Report columns: Serial No, Name, Author, Category, Status, Cost, Procurement Date
    const books = await Book.find({ type: 'Book' }).select(
        'serialNo name author category status cost procurementDate'
    );
    res.json(books);
});

// @desc    Get Master List of Movies
// @route   GET /api/reports/movies
// @access  Private/Admin
const getMasterListMovies = asyncHandler(async (req, res) => {
    const movies = await Book.find({ type: 'Movie' }).select(
        'serialNo name author category status cost procurementDate'
    );
    res.json(movies);
});

// @desc    Get Master List of Memberships
// @route   GET /api/reports/memberships
// @access  Private/Admin
const getMasterListMemberships = asyncHandler(async (req, res) => {
    const members = await Member.find({});
    res.json(members);
});

// @desc    Get Active Issues
// @route   GET /api/reports/active-issues
// @access  Private/Admin
const getActiveIssues = asyncHandler(async (req, res) => {
    // Columns: Serial No Book/Movie, Name of Book/Movie, Membership Id, Date of Issue, Date of Return (Due Date?)
    // Report screenshot says "Date of return", probably Due Date.

    const transactions = await Transaction.find({ status: 'Issued' })
        .populate('book', 'serialNo name')
        .populate('member', 'memberId');

    const formedTransactions = transactions.map(t => ({
        serialNo: t.book?.serialNo,
        bookName: t.book?.name,
        memberId: t.member?.memberId,
        issueDate: t.issueDate,
        returnDate: t.dueDate, // Display Due Date as "Date of return" expectation
    }));

    res.json(formedTransactions);
});

// @desc    Get Overdue Returns
// @route   GET /api/reports/overdue-returns
// @access  Private/Admin
const getOverdueReturns = asyncHandler(async (req, res) => {
    // Columns: Serial No, Name, Membership Id, Issue Date, Return Date, Fine Calculations

    const today = new Date();

    const transactions = await Transaction.find({
        status: 'Issued',
        dueDate: { $lt: today }
    })
        .populate('book', 'serialNo name')
        .populate('member', 'memberId');

    const formedTransactions = transactions.map(t => {
        const diffTime = Math.abs(today - new Date(t.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fine = diffDays * 10; // 10 per day

        return {
            serialNo: t.book?.serialNo,
            bookName: t.book?.name,
            memberId: t.member?.memberId,
            issueDate: t.issueDate,
            returnDate: t.dueDate,
            fine: fine
        };
    });

    res.json(formedTransactions);
});

// @desc    Get Issue Requests
// @route   GET /api/reports/issue-requests
// @access  Private/Admin
const getIssueRequests = asyncHandler(async (req, res) => {
    // Columns: Membership Id, Name of Book/Movie, Requested Date, Request Fulfilled Date (Empty?)

    const requests = await Transaction.find({ status: 'Requested' })
        .populate('book', 'name')
        .populate('member', 'memberId');

    const formedRequests = requests.map(r => ({
        memberId: t.member?.memberId,
        bookName: t.book?.name,
        requestedDate: t.issueDate, // Use issueDate field to store request date
        requestFulfilledDate: null
    }));

    res.json(formedRequests);
});

export {
    getMasterListBooks,
    getMasterListMovies,
    getMasterListMemberships,
    getActiveIssues,
    getOverdueReturns,
    getIssueRequests
};
