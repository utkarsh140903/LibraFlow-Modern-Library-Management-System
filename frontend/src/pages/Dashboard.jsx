import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        productDetails: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/dashboard/stats', config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    const title = user?.role === 'admin' ? "Admin Home Page" : "Home Page";

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <FaBook className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Books</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalBooks || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <FaUsers className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Active Members</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.activeMembers || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                        <FaClipboardList className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Issued Books</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.issuedBooks || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <FaExclamationTriangle className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Overdue Returns</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.overdueReturns || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
                <div className="px-6 py-4 border-b bg-gray-50 text-center">
                    <h3 className="text-lg font-bold text-gray-800">Product Details</h3>
                </div>
                <div className="overflow-x-auto">
                    {/* Displaying raw data in table for now */}
                    <table className="min-w-full table-auto border-collaspe">
                        <thead className="bg-gray-100">
                            <tr className="text-gray-800 font-bold border-b-2 border-gray-300">
                                <th className="py-3 px-6 text-left border-r w-1/3">Code No From</th>
                                <th className="py-3 px-6 text-left border-r w-1/3">Code No To</th>
                                <th className="py-3 px-6 text-left w-1/3">Category</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {stats.productDetails && stats.productDetails.length > 0 ? (
                                stats.productDetails.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left border-r font-mono font-medium">{item.codeNoFrom}</td>
                                        <td className="py-3 px-6 text-left border-r font-mono font-medium">{item.codeNoTo}</td>
                                        <td className="py-3 px-6 text-left font-semibold">{item.category}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-3 px-6 text-center text-gray-500">No product details available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Navigation Links for User (if not in sidebar, but layout usually has sidebar) */}
            {/* The requirement image shows links at top: Home Page, Back */}
            {/* And Reports, Transactions below Home Page */}
            {/* Since we have a sidebar for main nav, I'll assume those are just indicators or secondary links. */}
            {/* I will add a small text note or ensure sidebar covers it. */}
        </div>
    );
};

export default Dashboard;
