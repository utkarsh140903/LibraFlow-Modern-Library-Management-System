import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';
// import { v4 as uuidv4 } from 'uuid'; // Need to install uuid or just use random string

// Project: Library Management System
// Developer: Final Year Project Team

// @desc    Get all books/movies
// @route   GET /api/books
// @access  Private (User/Admin)
const getBooks = asyncHandler(async (req, res) => {
    // console.log("Fetching all books...");
    const books = await Book.find({});
    // console.log(`Found ${books.length} books`);
    res.json(books);
});

// @desc    Add a new book/movie (Supports multiple copies)
// @route   POST /api/books
// @access  Private/Admin
const addBook = asyncHandler(async (req, res) => {
    const { name, author, category, type, cost, procurementDate, quantity } = req.body;
    console.log("Adding book:", name);

    const copies = Number(quantity) || 1;
    const createdBooks = [];

    for (let i = 0; i < copies; i++) {
        // Generate Serial No
        // Format: TYPE-TIMESTAMP-RANDOM
        // Simple logic mainly for project demo
        const serialNo = `${type.charAt(0).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const book = await Book.create({
            name,
            author,
            category,
            type,
            cost,
            procurementDate,
            serialNo,
            status: 'Available',
        });
        createdBooks.push(book);
    }

    console.log(`Successfully added ${createdBooks.length} copies`);
    res.status(201).json(createdBooks);
});

// @desc    Update a book/movie
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
    const { name, author, category, type, cost, procurementDate, status, serialNo } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
        console.log("Updating book id:", req.params.id);

        book.name = name || book.name;
        book.author = author || book.author;
        book.category = category || book.category;
        book.type = type || book.type;
        book.cost = cost || book.cost;
        book.procurementDate = procurementDate || book.procurementDate;
        book.status = status || book.status;
        book.serialNo = serialNo || book.serialNo;

        const updatedBook = await book.save();
        res.json(updatedBook);
    } else {
        res.status(404);
        throw new Error('Book nahi mila (Book not found)');
    }
});

// @desc    Delete a book/movie
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        await book.remove();
        console.log("Book deleted successfully");
        res.json({ message: 'Book removed' });
    } else {
        res.status(404);
        throw new Error('Book not found to delete');
    }
});

// @desc    Get book by Serial No
// @route   GET /api/books/serial/:serialNo
// @access  Private
const getBookBySerial = asyncHandler(async (req, res) => {
    const book = await Book.findOne({ serialNo: req.params.serialNo });

    if (book) {
        res.json(book);
    } else {
        res.status(404);
        throw new Error('Book with this Serial No not found');
    }
});


export { getBooks, addBook, updateBook, deleteBook, getBookBySerial };
