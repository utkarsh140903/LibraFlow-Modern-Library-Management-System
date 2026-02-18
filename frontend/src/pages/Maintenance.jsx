import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Members from './Members';
import Books from './Books';
import Users from './Users';

const Maintenance = () => {
    const { logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('members');

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">System Maintenance</h1>
                    <p className="text-gray-500 mt-1">Manage users, books, and memberships</p>
                </div>
                {/* <Link to="/" className="text-blue-600 font-bold hover:underline">Home</Link> */}
                {/* Sidebar already handles navigation, no need for extra home link contextually here if we use Tabs */}
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6 flex divide-x border">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'members' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Membership Management
                </button>
                <button
                    onClick={() => setActiveTab('books')}
                    className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'books' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Books & Movies Master
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    User Management
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white shadow-lg rounded-lg p-6 min-h-[500px] border">
                {activeTab === 'members' && <Members isMaintenanceMode={true} />}
                {activeTab === 'books' && <Books isMaintenanceMode={true} />}
                {activeTab === 'users' && <Users isMaintenanceMode={true} />}
            </div>

            <div className="mt-8 flex justify-end">
                {/* Optional Logout if not in sidebar, but it is. Keeping as per original req just in case. */}
                {/* <button onClick={logout} className="text-red-500 font-bold hover:underline">Log Out</button> */}
            </div>
        </div>
    );
};

export default Maintenance;
