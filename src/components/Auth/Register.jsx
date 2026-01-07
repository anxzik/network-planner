import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onSwitch }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(username, email, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create Account</h2>
                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Register
                    </button>
                </form>
                <div className="text-sm text-center">
                    <button onClick={onSwitch} className="font-medium text-blue-600 hover:text-blue-500">
                        Already have an account? Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
