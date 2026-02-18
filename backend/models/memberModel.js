import mongoose from 'mongoose';

const memberSchema = mongoose.Schema(
    {
        memberId: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        contactName: {
            type: String,
            // what is contact name? Maybe "Guardian" or "Reference"?
            // Or just full name? But we have first/last.
            // Screenshot says "Contact Name". I'll keep it.
        },
        contactAddress: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        aadharCardNo: {
            type: String,
            required: true,
            unique: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        membershipDuration: {
            type: String,
            enum: ['6 months', '1 year', '2 years'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        amountPending: {
            type: Number,
            default: 0,
        },
        // Optional link to a User Login
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Member = mongoose.model('Member', memberSchema);

export default Member;
