// src/components/Wallet.jsx
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import TransactionTable from './TransactionTable'
import PaymentButton from './PaymentButton'

export default function Wallet() {
    const API = import.meta.env.VITE_API_URL || '/api'
    // const API = import.meta.env.VITE_API_URL || 'https://mazedakhale.in/api'

    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState([])
    const [amount, setAmount] = useState('')
    const [showTopupModal, setShowTopupModal] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')

    // Load balance & transactions
    const loadWallet = useCallback(async () => {
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
    }, [API])

    useEffect(() => {
        loadWallet()
    }, [loadWallet])

    const onSuccess = () => {
        setStatusMsg('✅ Payment successful!')
        loadWallet()
        setAmount('')
        setShowTopupModal(false) // Close the modal
        setTimeout(() => setStatusMsg(''), 3000)
    }

    // Close modal when clicking outside
    const handleModalClose = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            setShowTopupModal(false)
        }
    }

    // Render the main wallet dashboard
    return (
        <div className="p-4 ml-80 mt-14 bg-gray-100 min-h-screen mx-auto">
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
                        onClick={() => setShowTopupModal(true)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                    >
                        Add Money
                    </button>
                    <button
                        onClick={loadWallet}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
            <TransactionTable transactions={transactions} />

            {/* Top-up Modal */}
            {showTopupModal && (
                <div 
                    className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleModalClose}
                >
                    <div className="bg-white w-96 rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-orange-400 p-4 flex justify-between items-center">
                            <h5 className="text-white text-lg font-semibold">
                                Wallet Top-Up
                            </h5>
                            <button
                                onClick={() => setShowTopupModal(false)}
                                className="text-white hover:text-gray-200 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Current Balance: ₹{balance.toFixed(2)}
                                </label>
                            </div>
                            <input
                                type="number"
                                placeholder="Enter amount (₹)"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                min="1"
                                max="50000"
                            />
                            <PaymentButton
                                amount={Number(amount)}
                                apiBase={API}
                                onSuccess={onSuccess}
                            />
                            {statusMsg && (
                                <div className="mt-3 text-red-600 text-sm">{statusMsg}</div>
                            )}
                            <div className="mt-4 text-xs text-gray-500">
                                • Minimum amount: ₹1<br/>
                                • Maximum amount: ₹50,000<br/>
                                • Instant credit to your wallet
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
