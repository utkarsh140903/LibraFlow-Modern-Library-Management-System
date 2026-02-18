import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            // Required for Books, maybe not for Movies? 
            // Plan reports show Author. I'll make it optional string or required if type is Book?
            // For simplicity, just String.
        },
        category: {
            type: String,
            // Report shows Category.
        },
        serialNo: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['Book', 'Movie'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Available', 'Issued', 'Unified', 'Lost'],
            default: 'Available',
        },
        cost: {
            type: Number,
            // Report shows Cost.
            default: 0,
        },
        procurementDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
