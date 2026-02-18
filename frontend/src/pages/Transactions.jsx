import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { format, addDays, startOfDay, isBefore, differenceInDays } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const Transactions = () => {
    const { user, logout } = useContext(AuthContext);
    const [view, setView] = useState('availability');
    const navigate = useNavigate();

    // --- SHARED STATE & HOOKS ---
    const { register, handleSubmit, reset, watch, setValue } = useForm();

    // --- AVAILABILITY STATE ---
    const [availabilityResults, setAvailabilityResults] = useState([]);

    // --- DATA STATE ---
    const [allBooks, setAllBooks] = useState([]); // Store all books for dropdowns
    const [members, setMembers] = useState([]);

    // --- DERIVED LISTS ---
    const uniqueBookNames = [...new Set(allBooks.map(b => b.name))];
    const uniqueAuthors = [...new Set(allBooks.map(b => b.author))];
    const availableBooks = allBooks.filter(b => b.status === 'Available');

    // --- ISSUE STATE ---
    const [selectedBook, setSelectedBook] = useState(null);

    // --- RETURN STATE ---
    const [returnDetails, setReturnDetails] = useState(null);
    const [calculatedFine, setCalculatedFine] = useState(0);

    // --- PAY FINE STATE ---
    const [fineMember, setFineMember] = useState(null);

    // --- WATCHERS ---
    const watchBookId = watch('bookId');
    const watchIssueDate = watch('issueDate');
    const watchReturnDate = watch('returnDate');

    // --- EFFECTS ---
    useEffect(() => {
        // Fetch data based on view
        if (view === 'issue' || view === 'availability') {
            fetchBooks();
        }

        if (view === 'return') {
            // Use availabilityResults to store active transactions temporarily or create new state?
            // Since availabilityResults is for "Check Availability", reusing it might be confusing but saves state.
            // But "Check Availability" stores *Books*, here we need *Transactions*.
            // The format is different!
            // Check Book Availability returns: [{_id, name, serialNo, author, status}]
            // Active Transactions returns: [{_id, book: {name, serialNo...}, member: {...}, issueDate...}]
            // I MUST REUSE IT CAREFULLY or use a different state.
            // Let's use `availabilityResults` but be aware of the data shape difference in the render logic.
            fetchActiveTransactions();
        }

        if (view === 'issue') {
            fetchMembers();
            setValue('issueDate', format(new Date(), 'yyyy-MM-dd'));
        } else if (view === 'return') {
            setReturnDetails(null);
            reset();
            setValue('returnDate', format(new Date(), 'yyyy-MM-dd'));
        } else if (view === 'payFine') {
            setFineMember(null);
            reset();
        } else if (view === 'availability') {
            setAvailabilityResults([]);
            reset();
        }
    }, [view, user]);

    useEffect(() => {
        if (watchBookId && view === 'issue') {
            const book = allBooks.find(b => b._id === watchBookId);
            setSelectedBook(book || null);
        }
    }, [watchBookId, allBooks, view]);

    useEffect(() => {
        if (watchIssueDate && view === 'issue') {
            const date = new Date(watchIssueDate);
            const due = addDays(date, 15);
            setValue('dueDate', format(due, 'yyyy-MM-dd'));
        }
    }, [watchIssueDate, view, setValue]);

    useEffect(() => {
        if (view === 'return' && returnDetails && watchReturnDate) {
            const rDate = new Date(watchReturnDate);
            const dDate = new Date(returnDetails.dueDate);
            if (isBefore(dDate, rDate)) {
                const diff = differenceInDays(rDate, dDate);
                setCalculatedFine(diff * 10);
            } else {
                setCalculatedFine(0);
            }
        }
    }, [watchReturnDate, returnDetails, view]);


    // --- API CALLS ---
    const fetchBooks = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/books', config);
            setAllBooks(data); // Set ALL books
        } catch (error) { console.error(error); }
    };

    const fetchMembers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/members', config);
            setMembers(data.filter(m => m.status === 'Active'));
        } catch (error) { console.error(error); }
    };

    const fetchActiveTransactions = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Use status=Issued filter
            const { data } = await axios.get('http://localhost:5000/api/transactions?status=Issued', config);
            setAvailabilityResults(data); // Reusing this state to store transactions
        } catch (error) { console.error(error); }
    };

    // --- HANDLERS: AVAILABILITY ---
    const onCheckAvailability = async (data) => {
        // data.bookName and data.authorName come from dropdowns
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Build query params
            const params = new URLSearchParams();
            if (data.bookName) params.append('name', data.bookName);
            if (data.authorName) params.append('author', data.authorName);

            if (!data.bookName && !data.authorName) {
                alert("Please select a Book Name or Author");
                return;
            }

            const { data: results } = await axios.get(`http://localhost:5000/api/transactions/availability?${params.toString()}`, config);
            setAvailabilityResults(results);
        } catch (error) {
            console.error(error);
            alert('Error checking availability');
        }
    };

    // --- HANDLERS: ISSUE ---
    const onIssueSubmit = async (data) => {
        const today = startOfDay(new Date());
        const issue = startOfDay(new Date(data.issueDate));
        const due = startOfDay(new Date(data.dueDate));

        if (isBefore(issue, today)) { alert("Issue Date cannot be in the past."); return; }
        const maxDue = addDays(issue, 15);
        if (isBefore(maxDue, due)) { alert("Return Date cannot be more than 15 days from Issue Date."); return; }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/transactions/issue', data, config);
            alert('Book issued successfully');
            reset();
            // navigate('/transaction-success');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error issuing book');
        }
    };

    // --- HANDLERS: RETURN ---
    const getTransactionDetails = async () => {
        const serialNo = watch('serialNoSearch');
        if (!serialNo) { alert("Please enter a Serial Number"); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/transactions/details?serialNo=${serialNo}`, config);
            setReturnDetails(data);
            setValue('serialNo', data.book.serialNo);
            setValue('returnDate', format(new Date(), 'yyyy-MM-dd'));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error fetching details');
            setReturnDetails(null);
        }
    };

    const onReturnSubmit = async (data) => {
        if (calculatedFine > 0 && !data.finePaid) { alert(`Please collect fine of ${calculatedFine} and check 'Fine Paid'`); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                serialNo: returnDetails.book.serialNo,
                returnDate: data.returnDate,
                remarks: data.remarks,
                finePaid: data.finePaid
            };
            await axios.post('http://localhost:5000/api/transactions/return', payload, config);
            alert('Book returned successfully');
            // navigate('/transaction-success');
            setReturnDetails(null);
            reset();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error returning book');
        }
    };

    // --- HANDLERS: PAY FINE ---
    const checkMemberFine = async (data) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: allMembers } = await axios.get('http://localhost:5000/api/members', config);
            const found = allMembers.find(m => m.memberId === data.memberIdSearch);
            if (found) {
                setFineMember(found);
            } else {
                alert("Member not found");
                setFineMember(null);
            }
        } catch (error) { console.error(error); }
    };

    const onPayFineSubmit = async () => {
        if (!fineMember) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/transactions/pay-fine-member', {
                memberId: fineMember.memberId,
                amount: fineMember.amountPending // paying full amount
            }, config);
            alert("Fine paid successfully");
            setFineMember(null);
            reset();
            // navigate('/transaction-success');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error paying fine');
        }
    };



    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
                <Link to="/" className="text-blue-600 font-bold hover:underline">Home</Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                {['availability', 'issue', 'return', 'payFine'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setView(tab)}
                        className={`py-2 px-6 font-semibold focus:outline-none ${view === tab
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                            }`}
                    >
                        {tab === 'availability' && 'Check Availability'}
                        {tab === 'issue' && 'Issue Book'}
                        {tab === 'return' && 'Return Book'}
                        {tab === 'payFine' && 'Pay Fine'}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6 min-h-[400px]">
                {view === 'availability' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">Check Book Availability</h2>
                        <form onSubmit={handleSubmit(onCheckAvailability)} className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book Name</label>
                                <select {...register("bookName")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none">
                                    <option value="">Select Book Name</option>
                                    {uniqueBookNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <select {...register("authorName")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none">
                                    <option value="">Select Author</option>
                                    {uniqueAuthors.map((author, idx) => <option key={idx} value={author}>{author}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition h-10">
                                Search
                            </button>
                        </form>

                        {availabilityResults.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Book Name</th>
                                            <th className="p-3 text-left">Author</th>
                                            <th className="p-3 text-left">Serial No</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availabilityResults.map(b => (
                                            <tr key={b._id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{b.name}</td>
                                                <td className="p-3">{b.author}</td>
                                                <td className="p-3">{b.serialNo}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${b.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {b.status === 'Available' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBook(b);
                                                                setValue('bookId', b._id);
                                                                setView('issue');
                                                            }}
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            Issue
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-gray-500 text-center italic mt-10">Search for a book to see availability.</p>}
                    </div>
                )}

                {view === 'issue' && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 text-center">Issue Book</h2>
                        <form onSubmit={handleSubmit(onIssueSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Book</label>
                                    <select {...register("bookId", { required: true })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none">
                                        <option value="">Select Book</option>
                                        {availableBooks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.serialNo})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <input value={selectedBook?.author || ''} disabled className="w-full border p-2 rounded bg-gray-100" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
                                    <select {...register("memberId", { required: true })} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none">
                                        <option value="">Select Member</option>
                                        {members.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.memberId})</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label><input type="date" {...register("issueDate")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label><input type="date" {...register("dueDate")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label><textarea {...register("remarks")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none" rows="2"></textarea></div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => navigate('/transaction-cancelled')} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition">Confirm Issue</button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'return' && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 text-center">Return Book</h2>
                        <form onSubmit={handleSubmit(onReturnSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Name</label>
                                    <select
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none"
                                        onChange={(e) => {
                                            const bookName = e.target.value;
                                            setValue('selectedBookName', bookName);
                                            setValue('serialNo', '');
                                            setReturnDetails(null);
                                        }}
                                    >
                                        <option value="">Select Book</option>
                                        {[...new Set(availabilityResults.map(t => t.book.name))].map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial No <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("serialNo", { required: true })}
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none"
                                        onChange={(e) => {
                                            const serial = e.target.value;
                                            const details = availabilityResults.find(t => t.book.serialNo === serial);
                                            if (details) {
                                                setReturnDetails(details);
                                                setValue('serialNo', serial);
                                            }
                                        }}
                                    >
                                        <option value="">Select Serial No</option>
                                        {availabilityResults
                                            .filter(t => t.book.name === watch('selectedBookName'))
                                            .map(t => (
                                                <option key={t.book.serialNo} value={t.book.serialNo}>{t.book.serialNo}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input value={returnDetails?.book?.author || ''} disabled className="w-full border p-2 rounded bg-gray-100" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label><input value={returnDetails ? format(new Date(returnDetails.issueDate), 'yyyy-MM-dd') : ''} disabled className="w-full border p-2 rounded bg-gray-100" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label><input type="date" {...register("returnDate")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none" /></div>
                            </div>

                            {calculatedFine > 0 ? (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">Fine Due: {calculatedFine}</p>
                                        <p className="text-sm">Overdue by {calculatedFine / 10} days</p>
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("finePaid")} className="mr-2 h-5 w-5 text-red-600" />
                                        <span className="font-semibold">Mark as Paid</span>
                                    </label>
                                </div>
                            ) : returnDetails && <div className="p-3 bg-green-50 text-green-700 rounded text-center font-medium">No Fine Due</div>}

                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label><textarea {...register("remarks")} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none" rows="2"></textarea></div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => navigate('/transaction-cancelled')} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition">Confirm Return</button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'payFine' && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 text-center">Pay Fine</h2>
                        {!fineMember ? (
                            <div className="flex gap-4 items-center mb-8">
                                <input {...register("serialNoFineSearch")} placeholder="Enter Book Serial No" className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none" />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const serial = watch('serialNoFineSearch');
                                        if (!serial) return alert("Enter Serial No");
                                        try {
                                            const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                            const { data } = await axios.get(`http://localhost:5000/api/transactions/details?serialNo=${serial}&type=fine`, config);
                                            setFineMember(data);
                                            setValue('finePaid', false);
                                        } catch (err) {
                                            alert(err.response?.data?.message || "Error fetching details");
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Get Details
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(async (data) => {
                                try {
                                    if (!data.finePaid) return alert("Please check Fine Paid to confirm.");
                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                    await axios.put(`http://localhost:5000/api/transactions/pay-fine/${fineMember._id}`, {}, config);
                                    alert("Fine Paid Successfully!");
                                    setFineMember(null);
                                    reset();
                                } catch (err) {
                                    alert(err.response?.data?.message || "Payment Failed");
                                }
                            })} className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                                    <p><strong>Book:</strong> {fineMember.book.name} ({fineMember.book.serialNo})</p>
                                    <p><strong>Member:</strong> {fineMember.member?.firstName} {fineMember.member?.lastName}</p>
                                    <p><strong>Fine Amount:</strong> <span className="text-red-600 font-bold text-lg">{fineMember.fineAmount}</span></p>
                                </div>

                                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                    <label className="flex items-center cursor-pointer justify-center">
                                        <input type="checkbox" {...register("finePaid")} className="mr-2 h-5 w-5 text-red-600" />
                                        <span className="font-bold text-lg">Collect Payment & Clear Fine</span>
                                    </label>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setFineMember(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition">Cancel</button>
                                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition">Confirm Payment</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default Transactions;
