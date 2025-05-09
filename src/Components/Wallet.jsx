// src/components/Wallet.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TransactionTable from './TransactionTable'
import PaymentButton from './PaymentButton'

export default function Wallet() {
    const API = import.meta.env.VITE_API_URL || 'https://mazedakhale.in/api'

    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState([])
    const [amount, setAmount] = useState('')
    const [activeTab, setActiveTab] = useState('topup')
    const [statusMsg, setStatusMsg] = useState('')

    // Load balance & transactions
    const loadWallet = async () => {
        try {
            const token = localStorage.getItem('token') || ''
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            const {
                data: { balance: bal = 0 },
            } = await axios.get(`${API}/wallet`, { headers })
            setBalance(typeof bal === 'string' ? parseFloat(bal) : bal)

            const { data: txs = [] } = await axios.get(
                `${API}/wallet/transactions`,
                { headers }
            )
            setTransactions(txs)
        } catch (err) {
            if (err.response?.status === 401) {
                // Show session-expired message without redirect
                setStatusMsg('⚠️ Session expired. Please log in again.')
            } else {
                console.error('Wallet load error', err)
            }
        }
    }

    useEffect(() => {
        loadWallet()
    }, [API])

    const onSuccess = () => {
        setStatusMsg('✅ Payment successful!')
        loadWallet()
        setAmount('')
        setActiveTab('ledger')
        setTimeout(() => setStatusMsg(''), 3000)
    }

    // --- TOP-UP VIEW ---
    if (activeTab === 'topup') {
        return (
            <div style={{ marginLeft: '400px', marginRight: '300px' }} className="flex items-center justify-center p-4">
                <div className="bg-white w-96 rounded shadow overflow-hidden">
                    <div className="bg-orange-400 p-4">
                        <h5 className="text-white text-center font-semibold">
                            Wallet Top-Up
                        </h5>
                    </div>
                    <div className="p-4">
                        <input
                            type="number"
                            placeholder="Amount (₹)"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full mb-4 px-3 py-2 border rounded"
                        />
                        <PaymentButton
                            amount={Number(amount)}
                            apiBase={API}
                            onSuccess={onSuccess}
                        />
                        {statusMsg && (
                            <div className="mt-2 text-red-600 text-sm">{statusMsg}</div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- LEDGER VIEW ---
    return (
        <div style={{ marginLeft: '300px', marginRight: '200px' }} className="p-4 container mx-auto">
            {statusMsg && (
                <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                    {statusMsg}
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                    Balance: ₹{balance.toFixed(2)}
                </h3>
                <div className="space-x-2">
                    <button
                        onClick={() => setActiveTab('topup')}
                        className="px-4 py-2 bg-gray-200 rounded"
                    >
                        Add Money
                    </button>
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Transactions
                    </button>
                </div>
            </div>
            <TransactionTable transactions={transactions} />
        </div>
    )
}
