import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        username: 'admin',
        password: 'password123', // Will be hashed by pre-save hook? No, insertMany might skip hooks!
        // Mongoose insertMany DOES NOT trigger pre-save hooks by default unless ordered: false and one by one? 
        // Actually, usually seeder hashes manually or uses create() in a loop.
        // Let's use a pre-hashed password or modify seeder to use User.create or verify hooks.
        // Wait, typically we hash it here or use a helper.
        // User.create() fires hooks. User.insertMany() does NOT.
        // I should change seeder to use User.create if I want hooks, or hash here.
        // For simplicity, I will hash it here roughly? No, salt issues.
        // I will change seeder to use a loop and User.create.
        role: 'admin',
        contactNumber: '1234567890',
        address: 'Admin Address',
        aadharCardNo: '000011112222',
        status: 'active',
    },
    {
        name: 'Normal User',
        username: 'user',
        password: 'password123',
        role: 'user',
        contactNumber: '0987654321',
        address: 'User Address',
        aadharCardNo: '222211110000',
        status: 'active',
    },
];

export default users;
