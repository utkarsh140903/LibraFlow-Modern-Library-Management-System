import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password);
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        // Used a gradient background to make it look professional
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl transform transition-all hover:scale-105 duration-300">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Library App</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transform transition hover:-translate-y-1"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
