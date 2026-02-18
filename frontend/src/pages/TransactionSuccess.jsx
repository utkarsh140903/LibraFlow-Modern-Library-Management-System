import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const TransactionSuccess = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-4 flex flex-col h-screen">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                <h1 className="text-2xl font-bold">Library App</h1>
                <Link to="/" className="text-xl font-bold hover:underline">Home</Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold text-center">Transaction completed successfully.</h2>
            </div>

            <div className="mt-auto flex justify-end border-t-2 border-black pt-2">
                <button onClick={logout} className="font-bold text-xl text-black hover:text-red-700">Log Out</button>
            </div>

            {/* Note text from wireframe */}
            <div className="text-xs text-gray-500 mt-4">
                Note: If logged in as Admin - home will take to Admin Home Page<br />
                If logged in as user - home will take to User Home Page
            </div>
        </div>
    );
};

export default TransactionSuccess;
