import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
  
const Login = () => {
    const [formData, setFormData] = useState({
      username: '',
      password: '',
    });
    
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage(''); // Reset any previous error messages
  
      try {
        // Send the login request to the backend
        const response = await axios.post('http://localhost:5000/api/admin/login', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        // If login is successful, you'll receive a JWT token
        if (response.data.token) {
          // Save the token to localStorage or sessionStorage
          localStorage.setItem('admin_token', response.data.token);
  
          // Redirect to the admin dashboard
          navigate('/admin/AdminDashboard');
        }
      } catch (error) {
        // Handle error responses
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data.message || 'An error occurred. Please try again.');
        } else {
          setErrorMessage('Failed to connect to the server. Please check your network connection.');
        }
      }
    };
  

  return (
    <div className="flex justify-center items-center h-[100vh] bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            placeholder="******************"
            value={formData.password}
            onChange={handleInputChange}
          />
          {errorMessage && <span className="text-red-500 text-xs italic">{errorMessage}</span>}
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
