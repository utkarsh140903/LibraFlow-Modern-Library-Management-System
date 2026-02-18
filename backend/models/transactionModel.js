import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        issueDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        returnDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Issued', 'Returned', 'Requested'],
            default: 'Issued',
        },
        fineAmount: {
            type: Number,
            default: 0,
        },
        finePaid: {
            type: Boolean,
            default: false,
        },
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
