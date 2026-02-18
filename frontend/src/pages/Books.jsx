import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BOOK_STATUS } from '../utils/constants';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue } = useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const fetchBooks = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/books', config);
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [user]);

    const onSubmit = async (data) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            if (isEdit) {
                await axios.put(`http://localhost:5000/api/books/${currentBook._id}`, data, config);
                alert('Book updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/books', data, config);
                alert('Book added successfully');
            }

            fetchBooks();
            closeModal();
            // navigate('/transaction-success'); // Removed redundant redirect
        } catch (error) {
            console.error(error);
            alert('Error saving book');
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        reset();
        setShowModal(true);
    };

    const openEditModal = (book) => {
        setIsEdit(true);
        setCurrentBook(book);
        setValue('name', book.name);
        setValue('author', book.author);
        setValue('type', book.type);
        setValue('category', book.category);
        setValue('cost', book.cost);
        setValue('procurementDate', book.procurementDate.split('T')[0]);
        setValue('quantity', 1); // Quantity not editable on update per copy? Serial No is unique.
        // Update form has Serial No, which should be read-only or editable?
        // Screenshot "Update Book/Movie" has "Book/Movie Name", "Serial No", "Status", "Date".
        // It implies updating a SPECIFIC copy.
        // But my `currentBook` is a specific copy.
        setValue('serialNo', book.serialNo);
        setValue('status', book.status);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentBook(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`http://localhost:5000/api/books/${id}`, config);
                fetchBooks();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Books & Movies</h1>
                {user?.role === 'admin' && (
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add New
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by Name or Author..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <select
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Serial No</th>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Author</th>
                            <th className="py-3 px-6 text-left">Category</th>
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-center">Type</th>
                            {user?.role === 'admin' && <th className="py-3 px-6 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {books.filter(book => {
                            const matchesSearch = (book.name && book.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()));
                            const matchesCategory = filterCategory ? book.category === filterCategory : true;
                            return matchesSearch && matchesCategory;
                        }).map((book) => (
                            <tr key={book._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{book.serialNo}</td>
                                <td className="py-3 px-6 text-left">{book.name}</td>
                                <td className="py-3 px-6 text-left">{book.author}</td>
                                <td className="py-3 px-6 text-left">{book.category}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`py-1 px-3 rounded-full text-xs ${book.status === 'Available' ? 'bg-green-200 text-green-600' :
                                        book.status === 'Issued' ? 'bg-yellow-200 text-yellow-600' : 'bg-red-200 text-red-600'
                                        }`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">{book.type}</td>
                                {user?.role === 'admin' && (
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center">
                                            <button onClick={() => openEditModal(book)} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                {/* Icon Edit */}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(book._id)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                                {/* Icon Delete */}
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
                    <div className="bg-white p-8 rounded-md shadow-xl w-full max-w-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Update Book/Movie' : 'Add Book/Movie'}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Type Radio - Visible for BOTH Add and Update as per wireframes */}
                            <div className="flex items-start mb-4">
                                <div className="w-1/3"></div>
                                <div className="w-2/3 flex space-x-6">
                                    <label className="inline-flex items-center">
                                        <input type="radio" value="Book" {...register("type")} className="form-radio h-5 w-5 text-blue-600" defaultChecked />
                                        <span className="ml-2 text-lg">Book</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" value="Movie" {...register("type")} className="form-radio h-5 w-5 text-blue-600" />
                                        <span className="ml-2 text-lg">Movie</span>
                                    </label>
                                </div>
                            </div>

                            {/* Book/Movie Name - Visible for BOTH */}
                            <div className="flex items-center">
                                <label className="w-1/3 text-lg font-medium text-gray-700">Book/Movie Name</label>
                                <input type="text" {...register("name", { required: true })} className="w-2/3 border border-gray-300 rounded p-2" />
                            </div>

                            {!isEdit && (
                                <>
                                    {/* Add Specific Fields */}
                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Date of Procurement</label>
                                        <input type="date" {...register("procurementDate", { required: true })} className="w-2/3 border border-gray-300 rounded p-2" />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Category</label>
                                        <select {...register("category", { required: true })} className="w-2/3 border border-gray-300 rounded p-2">
                                            <option value="">Select Category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Quantity/Copies</label>
                                        <input type="number" {...register("quantity")} className="w-2/3 border border-gray-300 rounded p-2" defaultValue={1} min={1} />
                                    </div>
                                </>
                            )}

                            {isEdit && (
                                <>
                                    {/* Update Specific Fields */}
                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Serial No</label>
                                        <input type="text" {...register("serialNo")} className="w-2/3 border border-gray-300 rounded p-2 bg-gray-100" readOnly />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Status</label>
                                        <select {...register("status")} className="w-2/3 border border-gray-300 rounded p-2">
                                            <option value="Available">Available</option>
                                            <option value="Issued">Issued</option>
                                            <option value="Unified">Unified</option>
                                            <option value="Lost">Lost</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Category</label>
                                        <select {...register("category", { required: true })} className="w-2/3 border border-gray-300 rounded p-2">
                                            <option value="">Select Category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="w-1/3 text-lg font-medium text-gray-700">Date</label>
                                        <input type="date" {...register("procurementDate", { required: true })} className="w-2/3 border border-gray-300 rounded p-2" />
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

export default Books;
