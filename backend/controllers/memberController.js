import asyncHandler from 'express-async-handler';
import Member from '../models/memberModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
    // console.log("Fetching members list...");
    const members = await Member.find({});
    res.json(members);
});

// @desc    Add a new member
// @route   POST /api/members
// @access  Private/Admin
const addMember = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        contactName,
        contactAddress,
        aadharCardNo,
        startDate,
        endDate,
        membershipDuration,
        mobileNumber,
    } = req.body;

    console.log("Adding new member:", firstName, lastName);

    // Generate Member ID (e.g., MEM-TIMESTAMP)
    // Logic: MEM + Current Timestamp
    const memberId = `MEM-${Date.now()}`;

    const member = await Member.create({
        memberId,
        firstName,
        lastName,
        contactName,
        contactAddress,
        mobileNumber,
        aadharCardNo,
        startDate,
        endDate,
        membershipDuration,
        status: 'Active',
    });

    if (member) {
        console.log("Member created successfully with ID:", memberId);
        // TODO: Send welcome email to member (Future scope)
        res.status(201).json(member);
    } else {
        res.status(400);
        throw new Error('Invalid member data');
    }
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        contactName,
        contactAddress,
        aadharCardNo,
        startDate,
        endDate,
        membershipDuration,
        status,
        mobileNumber,
        extension, // '6 months', '1 year', etc.
    } = req.body;

    const member = await Member.findById(req.params.id);

    if (member) {
        member.firstName = firstName || member.firstName;
        member.lastName = lastName || member.lastName;
        member.contactName = contactName || member.contactName;
        member.contactAddress = contactAddress || member.contactAddress;
        member.mobileNumber = mobileNumber || member.mobileNumber;
        member.aadharCardNo = aadharCardNo || member.aadharCardNo;
        // Date updates require logic if extensions are passed
        if (extension) {
            console.log("Extending membership by:", extension);
            // Logic to extend endDate?
            // Valid extensions: 6 months, 1 year, 2 years
            const currentEnd = new Date(member.endDate);
            if (extension === '6 months') {
                currentEnd.setMonth(currentEnd.getMonth() + 6);
            } else if (extension === '1 year') {
                currentEnd.setFullYear(currentEnd.getFullYear() + 1);
            } else if (extension === '2 years') {
                currentEnd.setFullYear(currentEnd.getFullYear() + 2);
            }
            member.endDate = currentEnd;
        } else if (endDate) {
            member.endDate = endDate;
        }

        if (startDate) member.startDate = startDate;
        if (membershipDuration) member.membershipDuration = membershipDuration;
        if (status) member.status = status;

        const updatedMember = await member.save();
        res.json(updatedMember);
    } else {
        res.status(404);
        throw new Error('Member nahi mila (Member not found)');
    }
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin


// ... (other imports)

// ... (other controllers)

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
    const memberId = req.params.id;

    // Check for active transactions
    const activeTransaction = await Transaction.findOne({
        member: memberId,
        status: 'Issued'
    });

    if (activeTransaction) {
        res.status(400);
        throw new Error('Cannot delete member with active book issues. Collect books first.');
    }

    const member = await Member.findById(memberId);

    if (member) {
        // Use deleteOne() or findByIdAndDelete()
        await Member.deleteOne({ _id: memberId });
        res.json({ message: 'Member removed successfully' });
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Get member by ID or MemberID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
    // Check if :id is a Mongo ID or MemberID
    let member;
    if (req.params.id.startsWith('MEM-')) {
        member = await Member.findOne({ memberId: req.params.id });
    } else {
        member = await Member.findById(req.params.id);
    }

    if (member) {
        res.json(member);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});


export { getMembers, addMember, updateMember, deleteMember, getMemberById };
