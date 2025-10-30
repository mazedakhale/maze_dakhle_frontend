import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';

const AdminWallet = () => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    userId: null,
    transactionCount: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://72.60.206.65:3000/wallet', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('💰 Admin Wallet Data:', response.data);
      setWalletData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://72.60.206.65:3000/wallet/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('📝 Transactions:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="ml-[300px] p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Wallet Dashboard</h1>
        <p className="text-gray-600">Manage and monitor your wallet balance and transactions</p>
      </div>

      {/* Wallet Statistics Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)'
          }}>
            <AccountBalanceWalletIcon style={{ fontSize: '50px', marginRight: '20px' }} />
            <div style={{ flexGrow: 1, borderLeft: '2px solid white', paddingLeft: '15px' }}>
              <Typography variant="h6" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Current Balance
              </Typography>
              <Typography variant="h4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                ₹{loading ? '...' : Number(walletData.balance).toFixed(2)}
              </Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)'
          }}>
            <ReceiptIcon style={{ fontSize: '50px', marginRight: '20px' }} />
            <div style={{ flexGrow: 1, borderLeft: '2px solid white', paddingLeft: '15px' }}>
              <Typography variant="h6" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Total Transactions
              </Typography>
              <Typography variant="h4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {loading ? '...' : walletData.transactionCount || transactions.length}
              </Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f39c12',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)'
          }}>
            <TrendingUpIcon style={{ fontSize: '50px', marginRight: '20px' }} />
            <div style={{ flexGrow: 1, borderLeft: '2px solid white', paddingLeft: '15px' }}>
              <Typography variant="h6" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                User ID
              </Typography>
              <Typography variant="h4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                #{walletData.userId || 'N/A'}
              </Typography>
            </div>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-orange-500 text-white p-4">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left font-semibold">Date & Time</th>
                <th className="p-3 text-left font-semibold">Type</th>
                <th className="p-3 text-left font-semibold">Amount</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">{formatDate(transaction.createdAt)}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-white text-xs ${
                        transaction.type === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className={transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}₹{Number(transaction.amount)?.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded text-xs ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {transaction.paymentDetails?.description || 
                       transaction.merchantOrderId || 
                       'No description'}
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

export default AdminWallet;
