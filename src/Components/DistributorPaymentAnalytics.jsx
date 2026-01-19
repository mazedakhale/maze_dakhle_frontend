import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from "../config/api";
import jwtDecode from 'jwt-decode';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaWallet, FaChartLine } from 'react-icons/fa';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DistributorPaymentAnalytics = () => {
  const [paymentStats, setPaymentStats] = useState(null);
  const [commissionStats, setCommissionStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributorId, setDistributorId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDistributorId(decodedToken.user_id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (distributorId) {
      fetchAnalytics();
    }
  }, [distributorId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch payment requests
      const paymentsResponse = await axios.get(
        `${API_BASE_URL}/payment-requests/distributor/${distributorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const payments = paymentsResponse.data;
      
      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const stats = {
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        pending: payments.filter(p => p.status === 'Pending').length,
        pendingAmount: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0),
        approved: payments.filter(p => p.status === 'Approved' || p.status === 'Paid').length,
        approvedAmount: payments.filter(p => p.status === 'Approved' || p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0),
        rejected: payments.filter(p => p.status === 'Rejected').length,
        rejectedAmount: payments.filter(p => p.status === 'Rejected').reduce((sum, p) => sum + Number(p.amount), 0),
        
        // Today's stats
        todayPayments: payments.filter(p => new Date(p.created_at) >= today).length,
        todayAmount: payments.filter(p => new Date(p.created_at) >= today).reduce((sum, p) => sum + Number(p.amount), 0),
        todayApproved: payments.filter(p => new Date(p.created_at) >= today && (p.status === 'Approved' || p.status === 'Paid')).reduce((sum, p) => sum + Number(p.amount), 0),
        
        // This month's stats
        monthPayments: payments.filter(p => new Date(p.created_at) >= thisMonth).length,
        monthAmount: payments.filter(p => new Date(p.created_at) >= thisMonth).reduce((sum, p) => sum + Number(p.amount), 0),
        monthApproved: payments.filter(p => new Date(p.created_at) >= thisMonth && (p.status === 'Approved' || p.status === 'Paid')).reduce((sum, p) => sum + Number(p.amount), 0),
      };
      
      setPaymentStats(stats);
      setCommissionStats(stats); // Using same stats for commission
      setRecentPayments(payments.slice(0, 5).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Swal.fire('Error', 'Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const pieChartData = useMemo(() => {
    if (!paymentStats) return null;
    return {
      labels: ['Approved/Paid', 'Pending', 'Rejected'],
      datasets: [{
        data: [paymentStats.approved, paymentStats.pending, paymentStats.rejected],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: '#fff',
        borderWidth: 2,
      }]
    };
  }, [paymentStats]);

  const barChartData = useMemo(() => {
    if (!commissionStats) return null;
    return {
      labels: ['Total Requests', 'Approved', 'Pending', 'Rejected'],
      datasets: [{
        label: 'Payment Requests',
        data: [
          commissionStats.total,
          commissionStats.approved,
          commissionStats.pending,
          commissionStats.rejected
        ],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#2563eb', '#059669', '#d97706', '#dc2626'],
        borderWidth: 1,
      }]
    };
  }, [commissionStats]);

  if (loading) {
    return (
      <div className="ml-[300px] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="ml-[300px] p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment & Commission Analytics</h1>
        <p className="text-gray-600">Comprehensive overview of your earnings and payment status</p>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Requests</p>
              <p className="text-3xl font-bold">{paymentStats?.total || 0}</p>
            </div>
            <FaMoneyBillWave className="text-4xl opacity-80" />
          </div>
          <p className="text-sm mt-2 opacity-90">{formatCurrency(paymentStats?.totalAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-3xl font-bold">{paymentStats?.pending || 0}</p>
            </div>
            <FaHourglassHalf className="text-4xl opacity-80" />
          </div>
          <p className="text-sm mt-2 opacity-90">{formatCurrency(paymentStats?.pendingAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Approved/Paid</p>
              <p className="text-3xl font-bold">{paymentStats?.approved || 0}</p>
            </div>
            <FaCheckCircle className="text-4xl opacity-80" />
          </div>
          <p className="text-sm mt-2 opacity-90">{formatCurrency(paymentStats?.approvedAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(paymentStats?.approvedAmount)}</p>
            </div>
            <FaWallet className="text-4xl opacity-80" />
          </div>
          <p className="text-sm mt-2 opacity-90">Total Earned</p>
        </div>
      </div>

      {/* Commission Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine className="text-orange-500" />
          Commission Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <FaMoneyBillWave className="text-orange-500" />
              <p className="text-sm font-medium text-gray-700">Today's Requests</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{paymentStats?.todayPayments || 0}</p>
            <p className="text-sm text-orange-600 mt-1">{formatCurrency(paymentStats?.todayAmount)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <p className="text-sm font-medium text-gray-700">Today's Commission</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentStats?.todayApproved)}</p>
            <p className="text-sm text-green-600 mt-1">Approved Today</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FaMoneyBillWave className="text-blue-500" />
              <p className="text-sm font-medium text-gray-700">Monthly Requests</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{paymentStats?.monthPayments || 0}</p>
            <p className="text-sm text-blue-600 mt-1">{formatCurrency(paymentStats?.monthAmount)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-purple-500" />
              <p className="text-sm font-medium text-gray-700">Monthly Commission</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentStats?.monthApproved)}</p>
            <p className="text-sm text-purple-600 mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Total Commission Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Total Commission (All Sources)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
            <p className="text-sm opacity-90 mb-2">Total Earned Commission</p>
            <p className="text-4xl font-bold">{formatCurrency(paymentStats?.approvedAmount)}</p>
            <p className="text-sm mt-2 opacity-90">From {paymentStats?.approved || 0} approved requests</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-lg">
            <p className="text-sm opacity-90 mb-2">Pending Commission</p>
            <p className="text-4xl font-bold">{formatCurrency(paymentStats?.pendingAmount)}</p>
            <p className="text-sm mt-2 opacity-90">From {paymentStats?.pending || 0} pending requests</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Status Distribution</h3>
          {pieChartData && (
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Request Overview</h3>
          {barChartData && (
            <div className="h-64">
              <Bar 
                data={barChartData} 
                options={{ 
                  maintainAspectRatio: false, 
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Payment Requests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Payment Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <tr key={payment.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{payment.request_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.application_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'Approved' || payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No recent payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributorPaymentAnalytics;
