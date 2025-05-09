// src/components/PaymentTest.jsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PaymentButton from './PaymentButton'

export default function PaymentTest() {
    const { search } = useLocation()
    const [amount, setAmount] = useState(0)

    // On mount, grab ?amount=… from the URL
    useEffect(() => {
        const params = new URLSearchParams(search)
        const amt = params.get('amount')
        if (amt) setAmount(Number(amt))
    }, [search])

    return (
        <div className=" bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white w-80 rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-orange-400 px-6 py-4">
                    <h5 className="text-white text-center text-lg font-semibold">
                        Top Up Wallet
                    </h5>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label htmlFor="amount" className="block text-gray-700 mb-2">
                        Amount (₹)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        className="w-full border border-gray-300 px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        min="1"
                    />

                    <PaymentButton
                        amount={amount}
                        className="w-fullbg-orange-500 text-white py-2 rounded disabled:opacity-50"
                    />

                </div>
            </div>
        </div>
    )
}
