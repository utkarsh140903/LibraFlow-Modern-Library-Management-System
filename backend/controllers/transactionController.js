import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';
import { differenceInDays } from 'date-fns';

// Controller for all Transaction Logic (Issue/Return/Fine)

// @desc    Issue a book
// @route   POST /api/transactions/issue
// @access  Private/Admin
const issueBook = asyncHandler(async (req, res) => {
    const { bookId, memberId, issueDate, dueDate, remarks } = req.body;
    console.log("Issuing book:", bookId, "to member:", memberId);

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
        res.status(404);
        throw new Error('Book not found');
    }
    if (book.status !== 'Available') {
        res.status(400);
        throw new Error('Book is not available (Already Issued?)');
    }

    // Check if member exists and is active
    const member = await Member.findById(memberId);
    if (!member) {
        res.status(404);
        throw new Error('Invalid Member ID');
    }
    if (member.status !== 'Active') {
        res.status(400);
        throw new Error('Member is not active, cannot issue');
    }

    // Create Transaction
    const transaction = await Transaction.create({
        book: bookId,
        member: memberId,
        issueDate,
        dueDate,
        status: 'Issued',
        remarks,
    });

    if (transaction) {
        // Update book status
        book.status = 'Issued';
        await book.save();
        console.log("Transaction created successfully");

        res.status(201).json(transaction);
    } else {
        res.status(400);
        throw new Error('Invalid transaction data');
    }
});

// @desc    Return a book
// @route   POST /api/transactions/return
// @access  Private/Admin
const returnBook = asyncHandler(async (req, res) => {
    const { serialNo, returnDate, remarks, finePaid } = req.body;
    console.log("Returning Book Serial:", serialNo);

    // Find book by serial no
    const book = await Book.findOne({ serialNo });
    if (!book) {
        res.status(404);
        throw new Error('Book not found with this serial no');
    }

    // Find active transaction for this book
    const transaction = await Transaction.findOne({
        book: book._id,
        status: 'Issued',
    });

    if (!transaction) {
        res.status(404);
        throw new Error('No active issue found for this book');
    }

    const rDate = new Date(returnDate);
    const dDate = new Date(transaction.dueDate);

    // Calculate Fine Logic
    let fine = 0;
    if (rDate > dDate) {
        const diffTime = Math.abs(rDate - dDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fine = diffDays * 10; // 10 rs fine per day
        console.log(`Fine calculated: ${fine} for ${diffDays} days`);
    }

    // Validation: If fine exists, finePaid checkbox must be checked
    if (fine > 0 && !finePaid) {
        res.status(400);
        throw new Error(`Fee pending: ${fine}. Please collect fine first.`);
    }

    transaction.returnDate = rDate;
    transaction.status = 'Returned';
    transaction.fineAmount = fine;
    transaction.finePaid = fine > 0 ? true : false;
    if (remarks) transaction.remarks = remarks;

    await transaction.save();

    // Update Book Status back to Available
    book.status = 'Available';
    await book.save();
    console.log("Book Returned Successfully");

    res.json(transaction);
});

// @desc    Pay Fine
// @route   POST /api/transactions/pay-fine/:id
// @access  Private/Admin
const payFine = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (transaction) {
        if (transaction.finePaid) {
            res.status(400);
            throw new Error('Fine already paid hai');
        }

        transaction.finePaid = true;
        await transaction.save();

        // Reduce member pending amount
        const member = await Member.findById(transaction.member);
        if (member) {
            member.amountPending = Math.max(0, (member.amountPending || 0) - transaction.fineAmount);
            await member.save();
        }

        res.json(transaction);
    } else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});

// @desc    Get all transactions (Active/History)
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = asyncHandler(async (req, res) => {
    // console.log("Getting transactions...");
    const keyword = req.query.status ? { status: req.query.status } : {};

    const transactions = await Transaction.find({ ...keyword })
        .populate('book', 'name serialNo')
        .populate('member', 'firstName lastName memberId');

    res.json(transactions);
});

// @desc    Get active transaction by serial number
// @route   GET /api/transactions/details
// @access  Private/Admin
const getActiveTransaction = asyncHandler(async (req, res) => {
    const { serialNo, type } = req.query;

    if (!serialNo) {
        res.status(400);
        throw new Error('Serial Number required');
    }

    const book = await Book.findOne({ serialNo });
    if (!book) {
        res.status(404);
        throw new Error('Book not found');
    }

    let query = { book: book._id };

    if (type === 'fine') {
        // Find transaction with unpaid fine
        query.finePaid = false;
        query.fineAmount = { $gt: 0 };
    } else {
        // Default: Find active issued transaction
        query.status = 'Issued';
    }

    const transaction = await Transaction.findOne(query)
        .populate('book', 'name author serialNo')
        .populate('member', 'firstName lastName memberId');

    if (transaction) {
        res.json(transaction);
    } else {
        res.status(404);
        throw new Error(type === 'fine' ? 'No unpaid fines' : 'No active issue found');
    }
});

// @desc    Check book availability
// @route   GET /api/transactions/availability
// @access  Private
const checkAvailability = asyncHandler(async (req, res) => {
    const { keyword, name, author } = req.query;
    console.log("Checking availability for:", keyword || name);

    let query = {};

    if (keyword) {
        query.$or = [
            { serialNo: keyword },
            { name: { $regex: keyword, $options: 'i' } }
        ];
    } else if (name || author) {
        if (name) query.name = name;
        if (author) query.author = author;
    } else {
        res.status(400);
        throw new Error('Search criteria needed');
    }

    const books = await Book.find(query);

    res.json(books.map(b => ({
        _id: b._id,
        name: b.name,
        serialNo: b.serialNo,
        author: b.author,
        status: b.status
    })));
});

// @desc    Pay Member Fine (Clear Amount Pending)
// @route   POST /api/transactions/pay-fine-member
// @access  Private/Admin
const payMemberFine = asyncHandler(async (req, res) => {
    const { memberId, amount } = req.body;

    const member = await Member.findOne({ memberId: memberId });

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    if (member.amountPending <= 0) {
        res.status(400);
        throw new Error('No pending fine');
    }

    const payment = amount ? Number(amount) : member.amountPending;

    member.amountPending = Math.max(0, member.amountPending - payment);
    await member.save();

    res.json({
        message: `Fine paid successfully. Remaining: ${member.amountPending}`,
        member
    });
});

export {
    issueBook,
    returnBook,
    payFine,
    getTransactions,
    getActiveTransaction,
    checkAvailability,
    payMemberFine
};
