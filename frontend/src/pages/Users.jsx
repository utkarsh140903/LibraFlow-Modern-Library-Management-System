import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useForm } from 'react-hook-form';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [mode, setMode] = useState('new'); // 'new' or 'existing'

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, watch } = useForm();

    // Watch status for checkbox to sync with string value if needed, 
    // but better to just handle submit logic.

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/users', config);
            setUsers(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const onSubmit = async (data) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Map checkbox (true/false) to 'active'/'inactive' and role
            const payload = {
                ...data,
                status: data.status ? 'active' : 'inactive',
                role: data.isAdmin ? 'admin' : 'user'
            };

            if (mode === 'existing' && currentUserId) {
                // Update
                if (payload.password === '') delete payload.password; // Don't send empty password
                await axios.put(`http://localhost:5000/api/users/${currentUserId}`, payload, config);
            } else {
                // Create
                await axios.post('http://localhost:5000/api/users', payload, config);
            }
            fetchUsers();
            closeModal();
            navigate('/transaction-success');
        } catch (error) {
            console.error(error);
            alert('Error saving user');
        }
    };

    const openAddModal = () => {
        setMode('new');
        setCurrentUserId(null);
        reset({
            status: true, // Default active
            isAdmin: false // Default user
        });
        setShowModal(true);
    };

    const openEditModal = (u) => {
        setMode('existing');
        setCurrentUserId(u._id);
        setValue('name', u.name);
        setValue('username', u.username);
        setValue('status', u.status === 'active');
        setValue('isAdmin', u.role === 'admin');
        setShowModal(true);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'new') {
            setCurrentUserId(null);
            reset({
                status: true,
                role: 'user'
            });
        }
        // If switching to existing, we can't really "select" a user easily here without a dropdown.
        // So effectively, switching to active implies selecting a user, which must be done from the list.
        // But for visual compliance:
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentUserId(null);
        reset();
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add User</button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead><tr className="bg-gray-100 text-left"><th className="p-4">Name</th><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b">
                                <td className="p-4">{u.name}</td>
                                <td className="p-4">{u.username}</td>
                                <td className="p-4 capitalize">{u.role}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => openEditModal(u)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-xl w-full max-w-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">{mode === 'new' ? 'User Management' : 'User Management'}</h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Radios: New User / Existing User */}
                            <div className="flex items-start mb-4">
                                <div className="w-1/3 text-lg font-medium text-gray-700"></div>
                                <div className="w-2/3 flex space-x-6">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-5 w-5 text-blue-600"
                                            checked={mode === 'new'}
                                            readOnly
                                        />
                                        <span className="ml-2 text-lg">New User</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-5 w-5 text-blue-600"
                                            checked={mode === 'existing'}
                                            readOnly
                                        />
                                        <span className="ml-2 text-lg">Existing User</span>
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Name</label>
                                <input type="text" {...register('name', { required: true })} className="w-2/3 border border-gray-300 rounded p-2" />
                            </div>

                            {/* Username - Kept for functionality */}
                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Username</label>
                                <input type="text" {...register('username', { required: true })} className="w-2/3 border border-gray-300 rounded p-2" />
                            </div>

                            {/* Password - Kept for functionality */}
                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    {...register('password', { required: mode === 'new' })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                    placeholder={mode === 'existing' ? 'Leave blank to keep current' : ''}
                                />
                            </div>

                            {/* Checkboxes Container */}
                            <div className="flex items-center mt-4">
                                <div className="w-1/3"></div>
                                <div className="w-2/3 flex space-x-8">
                                    {/* Status Checkbox */}
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register('status')}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="ml-2 text-lg">Active</span>
                                    </label>

                                    {/* Admin Checkbox */}
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register('isAdmin')}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="ml-2 text-lg">Admin</span>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center gap-8 mt-8">
                                <button type="button" onClick={() => navigate('/transaction-cancelled')} className="px-8 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">Cancel</button>
                                <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;
