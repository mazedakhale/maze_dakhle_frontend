import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminDeletionCodeSettings = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch current deletion code (masked)
  useEffect(() => {
    fetchCurrentCode();
  }, []);

  const fetchCurrentCode = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin-settings/deletion-code`);
      setCurrentCode(response.data.code);
    } catch (error) {
      console.error('Failed to fetch current code:', error);
    }
  };

  const handleChangeDeletionCode = async () => {
    // Step 1: Get admin email
    const { value: email } = await Swal.fire({
      title: '🔐 Change Deletion Code',
      input: 'email',
      inputLabel: 'Enter your admin email to receive OTP',
      inputPlaceholder: 'admin@example.com',
      showCancelButton: true,
      confirmButtonColor: '#f58a3b',
      inputValidator: (value) => {
        if (!value) {
          return 'Email is required!';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email!';
        }
      },
    });

    if (!email) return;

    // Step 2: Request OTP
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/admin-settings/request-code-change`, { email });
      
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: 'Check your email for the verification code',
        timer: 2000,
        showConfirmButton: false,
      });

      // Step 3: Get OTP from user
      const { value: otp } = await Swal.fire({
        title: '📧 Enter OTP',
        input: 'text',
        inputLabel: 'Enter the 6-digit OTP sent to your email',
        inputPlaceholder: '123456',
        showCancelButton: true,
        confirmButtonColor: '#f58a3b',
        inputValidator: (value) => {
          if (!value) {
            return 'OTP is required!';
          }
          if (!/^\d{6}$/.test(value)) {
            return 'OTP must be 6 digits!';
          }
        },
      });

      if (!otp) {
        setLoading(false);
        return;
      }

      // Step 4: Get new deletion code
      const { value: newCode } = await Swal.fire({
        title: '🔑 New Deletion Code',
        input: 'text',
        inputLabel: 'Enter the new deletion code (minimum 4 characters)',
        inputPlaceholder: 'NewSecureCode123',
        showCancelButton: true,
        confirmButtonColor: '#f58a3b',
        inputValidator: (value) => {
          if (!value) {
            return 'Deletion code is required!';
          }
          if (value.length < 4) {
            return 'Code must be at least 4 characters!';
          }
        },
      });

      if (!newCode) {
        setLoading(false);
        return;
      }

      // Step 5: Verify OTP and update code
      const response = await axios.post(`${BASE_URL}/admin-settings/verify-code-change`, {
        email,
        otp,
        newDeletionCode: newCode,
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        html: `
          <p>${response.data.message}</p>
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">New Deletion Code:</p>
            <h2 style="margin: 10px 0; color: #28a745;">${newCode}</h2>
          </div>
        `,
        confirmButtonColor: '#f58a3b',
      });

      // Refresh current code display
      fetchCurrentCode();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to change deletion code',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 Deletion Code Settings
          </h1>
          <p className="text-gray-600 mb-6">
            Manage the system-wide deletion code used across all modules
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Deletion Code</p>
                <p className="text-2xl font-bold text-gray-800 tracking-wider">
                  {currentCode || 'Loading...'}
                </p>
              </div>
              <div className="text-4xl">🔒</div>
            </div>
          </div>

          <button
            onClick={handleChangeDeletionCode}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? 'Processing...' : '🔄 Change Deletion Code'}
          </button>

          {/* <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ How it works:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Change Deletion Code"</li>
              <li>Enter your admin email address</li>
              <li>Check your email for the 6-digit OTP</li>
              <li>Enter the OTP to verify your identity</li>
              <li>Set your new deletion code (minimum 4 characters)</li>
              <li>Restart the backend server to apply changes</li>
            </ol>
          </div>

          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>The OTP expires in 5 minutes</li>
              <li>The new code will be saved to your .env file</li>
              <li>You must restart the backend server for changes to take effect</li>
              <li>This code will be used across all modules (categories, users, etc.)</li>
              <li>Keep your deletion code secure and memorable</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDeletionCodeSettings;
