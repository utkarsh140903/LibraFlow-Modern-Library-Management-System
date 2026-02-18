import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Reports = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeReport, setActiveReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const reportsList = [
        { id: 'books', label: 'Master List of Books' },
        { id: 'movies', label: 'Master List of Movies' },
        { id: 'memberships', label: 'Master List of Memberships' },
        { id: 'activeIssues', label: 'Active Issues' },
        { id: 'overdue', label: 'Overdue Returns' },
        { id: 'pending', label: 'Pending Issue Requests' },
    ];

    const fetchReport = async (reportId) => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            let data = [];

            switch (reportId) {
                case 'books':
                    const resBooks = await axios.get('http://localhost:5000/api/books', config);
                    data = resBooks.data;
                    break;
                case 'movies':
                    const resMovies = await axios.get('http://localhost:5000/api/books', config);
                    data = resMovies.data.filter(b => b.type === 'Movie');
                    break;
                case 'memberships':
                    const resMembers = await axios.get('http://localhost:5000/api/members', config);
                    data = resMembers.data;
                    break;
                case 'activeIssues':
                    const resIssues = await axios.get('http://localhost:5000/api/transactions?status=Issued', config);
                    data = resIssues.data;
                    break;
                case 'overdue':
                    const resOverdue = await axios.get('http://localhost:5000/api/transactions?status=Issued', config);
                    data = resOverdue.data.filter(t => new Date(t.dueDate) < new Date());
                    break;
                case 'pending':
                    const resPending = await axios.get('http://localhost:5000/api/transactions?status=Requested', config);
                    data = resPending.data;
                    break;
                default:
                    data = [];
            }
            setReportData(data);
            setActiveReport(reportId);
        } catch (error) {
            console.error(error);
            alert("Error fetching report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Reports Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">View and analyze library records</p>
                </div>
                <Link to="/" className="text-blue-600 font-bold hover:underline">Home</Link>
            </div>

            {/* Report Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {reportsList.map(report => (
                    <button
                        key={report.id}
                        onClick={() => fetchReport(report.id)}
                        className={`p-4 rounded-lg shadow transition-all duration-200 border flex flex-col items-center justify-center text-center h-24
                            ${activeReport === report.id
                                ? 'bg-blue-600 text-white border-blue-600 transform scale-105 ring-2 ring-blue-300'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-blue-300'
                            }`}
                    >
                        <span className="font-semibold text-sm">{report.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg p-6 border min-h-[400px]">
                        {!activeReport ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p className="text-lg font-medium">Select a report from above to view details</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
                                        {reportsList.find(r => r.id === activeReport)?.label}
                                    </h3>
                                    {/* Export Buttons could go here */}
                                </div>

                                {/* Render Table based on activeReport */}
                                {activeReport === 'books' && (
                                    <Table
                                        headers={['Serial No', 'Book Name', 'Author', 'Category', 'Status', 'Cost', 'Procured']}
                                        data={reportData}
                                        renderRow={(b) => (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{b.serialNo}</td>
                                                <td className="px-6 py-4">{b.name}</td>
                                                <td className="px-6 py-4">{b.author}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{b.category}</span></td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${b.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{b.cost}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(b.procurementDate), 'yyyy-MM-dd')}</td>
                                            </>
                                        )}
                                    />
                                )}
                                {activeReport === 'movies' && (
                                    <Table
                                        headers={['Serial No', 'Movie Name', 'Author/Director', 'Category', 'Status', 'Cost', 'Procured']}
                                        data={reportData}
                                        renderRow={(b) => (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{b.serialNo}</td>
                                                <td className="px-6 py-4">{b.name}</td>
                                                <td className="px-6 py-4">{b.author}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">{b.category}</span></td>
                                                <td className="px-6 py-4">{b.status}</td>
                                                <td className="px-6 py-4">{b.cost}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(b.procurementDate), 'yyyy-MM-dd')}</td>
                                            </>
                                        )}
                                    />
                                )}
                                {activeReport === 'memberships' && (
                                    <Table
                                        headers={['ID', 'Name', 'Contact', 'Address', 'Aadhar', 'Start', 'End', 'Status', 'Fine']}
                                        data={reportData}
                                        renderRow={(m) => (
                                            <>
                                                <td className="px-6 py-4 font-bold text-gray-900">{m.memberId}</td>
                                                <td className="px-6 py-4">{m.firstName} {m.lastName}</td>
                                                <td className="px-6 py-4">{m.contactName}</td>
                                                <td className="px-6 py-4 truncate max-w-xs" title={m.contactAddress}>{m.contactAddress}</td>
                                                <td className="px-6 py-4">{m.aadharCardNo}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(m.startDate), 'yyyy-MM-dd')}</td>
                                                <td className="px-6 py-4 text-gray-500">{format(new Date(m.endDate), 'yyyy-MM-dd')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${m.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-red-600 font-bold">{m.amountPending > 0 ? m.amountPending : '-'}</td>
                                            </>
                                        )}
                                    />
                                )}
                                {activeReport === 'activeIssues' && (
                                    <Table
                                        headers={['Book/Movie', 'Member ID', 'Issue Date', 'Due Date']}
                                        data={reportData}
                                        renderRow={(t) => (
                                            <>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{t.book?.name}</span>
                                                        <span className="text-xs text-gray-500">{t.book?.serialNo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{t.member?.memberId}</td>
                                                <td className="px-6 py-4">{format(new Date(t.issueDate), 'yyyy-MM-dd')}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-600">{format(new Date(t.dueDate), 'yyyy-MM-dd')}</td>
                                            </>
                                        )}
                                    />
                                )}
                                {activeReport === 'overdue' && (
                                    <Table
                                        headers={['Book', 'Member ID', 'Issue Date', 'Due Date', 'Overdue Days', 'Fine Est.']}
                                        data={reportData}
                                        renderRow={(t) => {
                                            const today = new Date();
                                            const dueDate = new Date(t.dueDate);
                                            const diffTime = today - dueDate;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            return (
                                                <>
                                                    <td className="px-6 py-4 font-medium">{t.book?.name} <span className="text-xs text-gray-500">({t.book?.serialNo})</span></td>
                                                    <td className="px-6 py-4">{t.member?.memberId}</td>
                                                    <td className="px-6 py-4 text-gray-500">{format(new Date(t.issueDate), 'yyyy-MM-dd')}</td>
                                                    <td className="px-6 py-4 text-red-600 font-bold">{format(dueDate, 'yyyy-MM-dd')}</td>
                                                    <td className="px-6 py-4 text-center"><span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">{diffDays > 0 ? diffDays : 0} days</span></td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{diffDays > 0 ? diffDays * 10 : 0}</td>
                                                </>
                                            );
                                        }}
                                    />
                                )}
                                {activeReport === 'pending' && (
                                    <Table
                                        headers={['Member ID', 'Book Name', 'Requested Date', 'Status']}
                                        data={reportData}
                                        renderRow={(t) => (
                                            <>
                                                <td className="px-6 py-4">{t.member?.memberId}</td>
                                                <td className="px-6 py-4">{t.book?.name}</td>
                                                <td className="px-6 py-4">{t.requestDate ? format(new Date(t.requestDate), 'yyyy-MM-dd') : '-'}</td>
                                                <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span></td>
                                            </>
                                        )}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Table = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.length > 0 ? data.map((item, i) => (
                    <tr key={item._id || i} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                        {renderRow(item)}
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500 italic">
                            No records found for this report.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

export default Reports;
