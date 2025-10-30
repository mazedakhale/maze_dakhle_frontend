import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';

const DistributorPaymentRequest = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchPaymentRequests();
    fetchStatistics();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://72.60.206.65:3000/payment-requests');
      setPaymentRequests(response.data);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      Swal.fire('Error', 'Failed to fetch payment requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://72.60.206.65:3000/payment-requests/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleApprove = async (requestId) => {
    const result = await Swal.fire({
      title: 'Approve Payment Request?',
      text: 'This will deduct the amount from the customer wallet and mark as paid.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://72.60.206.65:3000/payment-requests/${requestId}/status`, {
          status: 'Approved',
        });
        Swal.fire('Approved!', 'Payment has been processed successfully.', 'success');
        fetchPaymentRequests();
        fetchStatistics();
      } catch (error) {
        console.error('Error approving payment:', error);
        Swal.fire(
          'Error',
          error.response?.data?.message || 'Failed to approve payment request',
          'error'
        );
      }
    }
  };

  const handleReject = async (requestId) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Payment Request',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputAttributes: {
        'aria-label': 'Enter reason for rejection',
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      },
    });

    if (reason) {
      try {
        await axios.put(`http://72.60.206.65:3000/payment-requests/${requestId}/status`, {
          status: 'Rejected',
          rejection_reason: reason,
        });
        Swal.fire('Rejected!', 'Payment request has been rejected.', 'success');
        fetchPaymentRequests();
        fetchStatistics();
      } catch (error) {
        console.error('Error rejecting payment:', error);
        Swal.fire('Error', 'Failed to reject payment request', 'error');
      }
    }
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

  const filteredRequests = statusFilter === 'All'
    ? paymentRequests
    : paymentRequests.filter(req => req.status === statusFilter);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Requests Dashboard</h1>
        <p className="text-gray-600">Review and manage distributor payment requests</p>
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
              <FaMoneyBillWave className="text-3xl text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.pendingAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{statistics.paid}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{formatCurrency(statistics.paidAmount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
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
          <span className="text-sm text-gray-600 ml-auto">
            Showing {filteredRequests.length} request(s)
          </span>
        </div>
      </div>

      {/* Payment Requests Table */}
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
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No payment requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.request_id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center gap-1"
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.request_id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      ) : request.status === 'Rejected' && request.rejection_reason ? (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Reason:</span> {request.rejection_reason}
                        </div>
                      ) : (
                        <span className="text-gray-400">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributorPaymentRequest;
