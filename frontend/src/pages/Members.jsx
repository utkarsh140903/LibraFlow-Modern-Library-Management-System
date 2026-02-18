import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MEMBERSHIP_DURATIONS } from '../utils/constants';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm();

    const handleDateChange = (start, duration) => {
        if (!start || !duration) return;

        const startDate = new Date(start);
        const endDate = new Date(startDate);

        if (duration === '6 months') {
            endDate.setMonth(endDate.getMonth() + 6);
        } else if (duration === '1 year') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (duration === '2 years') {
            endDate.setFullYear(endDate.getFullYear() + 2);
        }

        setValue('endDate', endDate.toISOString().split('T')[0]);
    };

    const fetchMembers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/members', config);
            setMembers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [user]);

    const onSubmit = async (data) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            if (isEdit) {
                // Handle Extension logic in backend or frontend?
                // Backend handles "extension" field ('6 months', etc).
                // Form should have extension dropdown if editing?
                await axios.put(`http://localhost:5000/api/members/${currentMember._id}`, data, config);
                alert('Member updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/members', data, config);
                alert('Member added successfully');
            }

            fetchMembers();
            closeModal();
            // navigate('/transaction-success'); // Navigate to success page
        } catch (error) {
            console.error(error);
            alert('Error saving member');
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        reset();
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setIsEdit(true);
        setCurrentMember(member);
        setValue('firstName', member.firstName);
        setValue('lastName', member.lastName);
        setValue('contactName', member.contactName);
        setValue('contactAddress', member.contactAddress);
        setValue('mobileNumber', member.mobileNumber);
        setValue('aadharCardNo', member.aadharCardNo);
        setValue('startDate', member.startDate.split('T')[0]);
        setValue('endDate', member.endDate.split('T')[0]);
        setValue('membershipDuration', member.membershipDuration);
        setValue('status', member.status);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentMember(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`http://localhost:5000/api/members/${id}`, config);
                fetchMembers();
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Error deleting member');
            }
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Members</h1>
                {user?.role === 'admin' && (
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add New
                    </button>
                )}
            </div>

            <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Member ID</th>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Contact</th>
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-center">Expiry</th>
                            {user?.role === 'admin' && <th className="py-3 px-6 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {members.map((member) => (
                            <tr key={member._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{member.memberId}</td>
                                <td className="py-3 px-6 text-left">{member.firstName} {member.lastName}</td>
                                <td className="py-3 px-6 text-left">{member.mobileNumber}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`py-1 px-3 rounded-full text-xs ${member.status === 'Active' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">{new Date(member.endDate).toLocaleDateString()}</td>
                                {user?.role === 'admin' && (
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center">
                                            <button onClick={() => openEditModal(member)} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(member._id)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-xl w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Update Membership' : 'Add Membership'}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Shared Fields (Add & Edit) */}
                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    {...register("firstName", {
                                        required: "First Name is required",
                                        pattern: { value: /^[A-Za-z\s]+$/, message: "Only alphabets allowed" }
                                    })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                />
                            </div>
                            {errors.firstName && <p className="text-red-500 text-xs ml-[33%]">{errors.firstName.message}</p>}

                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    {...register("lastName", {
                                        required: "Last Name is required",
                                        pattern: { value: /^[A-Za-z\s]+$/, message: "Only alphabets allowed" }
                                    })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                />
                            </div>
                            {errors.lastName && <p className="text-red-500 text-xs ml-[33%]">{errors.lastName.message}</p>}

                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Contact Name</label>
                                <input
                                    type="text"
                                    {...register("contactName", {
                                        required: "Contact Name is required",
                                        pattern: { value: /^[A-Za-z\s]+$/, message: "Only alphabets allowed" }
                                    })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                />
                            </div>
                            {errors.contactName && <p className="text-red-500 text-xs ml-[33%]">{errors.contactName.message}</p>}

                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Contact Address</label>
                                <input
                                    type="text"
                                    {...register("contactAddress", { required: "Address is required" })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                />
                            </div>
                            {errors.contactAddress && <p className="text-red-500 text-xs ml-[33%]">{errors.contactAddress.message}</p>}

                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Mobile Number</label>
                                <input
                                    type="text"
                                    {...register("mobileNumber", {
                                        required: "Mobile Number is required",
                                        pattern: { value: /^\d{10}$/, message: "Must be exactly 10 digits" }
                                    })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                    placeholder="10-digit mobile number"
                                />
                            </div>
                            {errors.mobileNumber && <p className="text-red-500 text-xs ml-[33%]">{errors.mobileNumber.message}</p>}

                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Aadhar Card No</label>
                                <input
                                    type="text"
                                    {...register("aadharCardNo", {
                                        required: "Aadhar Card is required",
                                        pattern: { value: /^\d{12}$/, message: "Must be exactly 12 digits" }
                                    })}
                                    className="w-2/3 border border-gray-300 rounded p-2"
                                    placeholder="12-digit Aadhar number"
                                />
                            </div>
                            {errors.aadharCardNo && <p className="text-red-500 text-xs ml-[33%]">{errors.aadharCardNo.message}</p>}


                            {!isEdit && (
                                <>
                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            {...register("startDate", {
                                                required: true,
                                                onChange: (e) => handleDateChange(e.target.value, getValues('membershipDuration'))
                                            })}
                                            className="w-2/3 border border-gray-300 rounded p-2"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">End Date</label>
                                        <input type="date" {...register("endDate", { required: true })} className="w-2/3 border border-gray-300 rounded p-2" readOnly />
                                    </div>
                                    <div className="flex items-start">
                                        <label className="w-1/3 text-lg font-medium text-gray-700 pt-2">Membership</label>
                                        <div className="w-2/3 flex flex-wrap gap-4">
                                            {MEMBERSHIP_DURATIONS.map(duration => (
                                                <label key={duration.value} className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value={duration.value}
                                                        {...register("membershipDuration", {
                                                            required: true,
                                                            onChange: (e) => {
                                                                const startDate = getValues('startDate');
                                                                if (startDate) {
                                                                    handleDateChange(startDate, e.target.value);
                                                                }
                                                            }
                                                        })}
                                                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                                    />
                                                    <span className="ml-2 text-gray-700">{duration.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {isEdit && (
                                <>
                                    <div className="border-t pt-4 mt-4">
                                        <h3 className="font-bold text-gray-700 mb-2">Membership Management</h3>
                                        <div className="flex items-center mb-2">
                                            <label className="w-1/3 text-lg font-medium text-gray-700">Membership Number</label>
                                            <input type="text" value={currentMember?.memberId || ''} disabled className="w-2/3 border border-gray-300 rounded p-2 bg-gray-100" />
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <label className="w-1/3 text-lg font-medium text-gray-700">Start Date</label>
                                            <input type="date" {...register("startDate")} disabled className="w-2/3 border border-gray-300 rounded p-2 bg-gray-100" />
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <label className="w-1/3 text-lg font-medium text-gray-700">End Date</label>
                                            <input type="date" {...register("endDate")} disabled className="w-2/3 border border-gray-300 rounded p-2 bg-gray-100" />
                                        </div>

                                        <div className="flex items-start mb-2">
                                            <label className="w-1/3 text-lg font-medium text-gray-700 pt-2">Extend Membership</label>
                                            <div className="w-2/3 flex flex-wrap gap-4">
                                                {MEMBERSHIP_DURATIONS.map(duration => (
                                                    <label key={duration.value} className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            value={duration.value}
                                                            {...register("extension")}
                                                            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                                        />
                                                        <span className="ml-2 text-gray-700">{duration.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                                            <label className="w-1/3 text-lg font-medium text-gray-700">Membership Status</label>
                                            <div className="w-2/3 flex gap-6">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value="Active"
                                                        {...register("status")}
                                                        className="form-radio h-5 w-5 text-green-600"
                                                    />
                                                    <span className="ml-2 text-green-700 font-bold">Active</span>
                                                </label>
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value="Inactive"
                                                        {...register("status")}
                                                        className="form-radio h-5 w-5 text-red-600"
                                                    />
                                                    <span className="ml-2 text-red-700 font-bold">Inactive</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-center gap-8 mt-8">
                                <button type="button" onClick={closeModal} className="px-8 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">Cancel</button>
                                <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
