import { FaHome, FaBook, FaUsers, FaClipboardList, FaChartBar, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Home', path: '/', icon: <FaHome /> },
        { name: 'Books', path: '/books', icon: <FaBook /> },
        { name: 'Members', path: '/members', icon: <FaUsers /> },
        { name: 'Transactions', path: '/transactions', icon: <FaClipboardList /> },
        { name: 'Reports', path: '/reports', icon: <FaChartBar /> },
    ];

    if (user && user.role === 'admin') {
        menuItems.push({ name: 'Maintenance', path: '/maintenance', icon: <FaClipboardList /> });
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl`}
            >
                <div className="h-16 flex items-center justify-center border-b border-slate-700">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold tracking-wider text-green-400">Library App</span>
                    ) : (
                        <span className="text-xl font-bold text-green-400">LA</span>
                    )}
                </div>

                <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-6 py-3 transition-colors duration-200 
                                    ${isActive
                                        ? 'bg-blue-600 text-white border-r-4 border-green-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                                title={!isSidebarOpen ? item.name : ''}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-6 py-3 text-slate-400 hover:bg-red-600 hover:text-white rounded transition-colors duration-200`}
                        title="Logout"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <FaBars className="text-xl" />
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
