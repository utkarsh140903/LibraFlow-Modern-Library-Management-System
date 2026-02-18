import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LogOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="container mx-auto p-4 flex flex-col h-screen">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                <h1 className="text-2xl font-bold">Library App</h1>
                <Link to="/login" className="text-xl font-bold hover:underline">Login</Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold text-center text-green-600">You have successfully logged out.</h2>
                <p className="text-gray-500 mt-4">Redirecting to login page...</p>
            </div>

            <div className="mt-auto pt-2">
            </div>
        </div>
    );
};

export default LogOut;
