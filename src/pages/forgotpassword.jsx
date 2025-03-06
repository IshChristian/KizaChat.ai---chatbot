import React, { useState, useEffect } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('User');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get user name from cookie when component mounts
    const nameFromCookie = getCookie('userName');
    
    if (nameFromCookie) {
      setUserName(nameFromCookie);
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simulate API call to request password reset
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // You would typically call your API here to trigger the password reset email
    }, 1000);
  };

  if (isSubmitted) {
    // Show confirmation screen after submission
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="text-4xl text-blue-500 mb-4">✉️</div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Password Reset Request Sent</h1>
          </div>
          
          <div className="text-gray-600 mb-6">
            <p className="mb-2">Hello <span className="font-semibold text-gray-800">{userName}</span>,</p>
            <p className="mb-2">We've sent a password reset link to:</p>
            <div className="inline-block bg-gray-100 px-4 py-2 rounded font-semibold text-gray-800 my-3">
              {email}
            </div>
            <p>Please check your inbox and follow the instructions in the email to reset your password. The link will expire in 30 minutes.</p>
          </div>
          
          <a 
            href="/login" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Return to Login
          </a>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Didn't receive an email? Check your spam folder or <button onClick={() => setIsSubmitted(false)} className="text-blue-500 hover:underline">try again</button>.</p>
          </div>
        </div>
      </div>
    );
  }

  // Initial form to enter email
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl text-blue-500 mb-4">🔑</div>
          <h1 className="text-2xl font-semibold text-gray-800">Forgot Password</h1>
          <p className="text-gray-600 mt-2">Enter your email address to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-600 outline-none"
              placeholder="your@email.com"
              required
            />
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-blue-500 hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;