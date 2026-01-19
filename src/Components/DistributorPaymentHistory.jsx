import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from "../config/api";
import jwtDecode from 'jwt-decode';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaMoneyBillWave } from 'react-icons/fa';

const DistributorPaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [distributorId, setDistributorId] = useState(null);

  useEffect(() => {
    // Get distributor ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDistributorId(decodedToken.user_id);
      } catch (error) {
        console.error('Error decoding token:', error);
        Swal.fire('Error', 'Failed to get user information', 'error');
      }
    }
  }, []);

  useEffect(() => {
    if (distributorId) {
      fetchPaymentHistory();
    }
  }, [distributorId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/payment-requests/distributor/${distributorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPaymentHistory(response.data);
      calculateStatistics(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      Swal.fire('Error', 'Failed to fetch payment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const stats = {
      total: data.length,
      totalAmount: data.reduce((sum, item) => sum + Number(item.amount), 0),
      pending: data.filter(item => item.status === 'Pending').length,
      pendingAmount: data.filter(item => item.status === 'Pending').reduce((sum, item) => sum + Number(item.amount), 0),
      approved: data.filter(item => item.status === 'Approved' || item.status === 'Paid').length,
      approvedAmount: data.filter(item => item.status === 'Approved' || item.status === 'Paid').reduce((sum, item) => sum + Number(item.amount), 0),
      rejected: data.filter(item => item.status === 'Rejected').length,
      rejectedAmount: data.filter(item => item.status === 'Rejected').reduce((sum, item) => sum + Number(item.amount), 0),
    };
    setStatistics(stats);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = paymentHistory.filter(req => {
    // Status filter
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      req.applicant_name?.toLowerCase().includes(searchLower) ||
      req.category_name?.toLowerCase().includes(searchLower) ||
      req.subcategory_name?.toLowerCase().includes(searchLower) ||
      req.amount?.toString().includes(searchLower) ||
      req.request_id?.toString().includes(searchLower) ||
      req.application_id?.toLowerCase().includes(searchLower) ||
      req.utr_number?.toLowerCase().includes(searchLower) ||
      req.status?.toLowerCase().includes(searchLower)
    );
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="ml-[300px] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ml-[300px] p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment History</h1>
        <p className="text-gray-600">Track all your payment requests and their statuses</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.totalAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
              </div>
              <FaHourglassHalf className="text-3xl text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.pendingAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved/Paid</p>
                <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.approvedAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.rejectedAmount)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-[500px]">
            <input
              type="text"
              placeholder="Search by applicant, category, application ID, amount, UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Showing {filteredHistory.length} of {paymentHistory.length} request(s)
            {searchTerm && <span className="ml-2 text-orange-600 font-semibold">(Filtered by search)</span>}
          </span>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category / Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UTR Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Raised
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                    No payment history found
                  </td>
                </tr>
              ) : (
                filteredHistory.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.request_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.application_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.applicant_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{request.category_name}</div>
                      <div className="text-xs text-gray-500">{request.subcategory_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'Approved' || request.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.payment_method ? (
                        <span className="capitalize">
                          {request.payment_method === 'qr' ? 'QR Code' : 
                           request.payment_method === 'upi' ? 'UPI' : 
                           request.payment_method === 'bank' ? 'Bank Transfer' : 
                           request.payment_method}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.utr_number ? (
                        <span className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-700">
                          {request.utr_number}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.updated_at ? formatDate(request.updated_at) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reasons */}
      {filteredHistory.some(r => r.status === 'Rejected' && r.rejection_reason) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Rejection Details</h3>
          {filteredHistory
            .filter(r => r.status === 'Rejected' && r.rejection_reason)
            .map(request => (
              <div key={request.request_id} className="mb-2 p-3 bg-white rounded border border-red-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-900">Request #{request.request_id}</span>
                    <span className="text-sm text-gray-600 ml-2">({request.application_id})</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(request.amount)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Reason:</span> {request.rejection_reason}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DistributorPaymentHistory;
