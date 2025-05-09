import React, { useState } from 'react'
import axios from 'axios'

/** Dynamically inject Razorpay’s script */
function loadRazorpaySdk() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve()
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
        document.body.appendChild(s)
    })
}

export default function PaymentButton({ amount, apiBase, onSuccess }) {
    const [loading, setLoading] = useState(false)

    const handlePay = async () => {
        if (loading || !amount) return
        setLoading(true)
        try {
            await loadRazorpaySdk()

            const token = localStorage.getItem('token')
            if (!token) throw new Error('Not authenticated')

            // 1) Kick off top-up & get back order details
            const { data } = await axios.post(
                `${apiBase}/wallet/topup`,
                { amount }, // in ₹
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const {
                key,
                orderId,
                amount: amtPaise,     // in paise
                currency,
                merchantOrderId,
            } = data

            // 2) Open Razorpay checkout
            const rzp = new window.Razorpay({
                key,
                amount: amtPaise,
                currency,
                order_id: orderId,
                handler: async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
                    // 3) Fire your backend callback *once* with the rupee amount
                    await axios.post(
                        `${apiBase}/payment/callback`,
                        {
                            merchantOrderId,
                            razorpay_order_id,
                            razorpay_payment_id,
                            razorpay_signature,
                            state: 'COMPLETED',
                            amount,         // in ₹
                            paymentDetails: [
                                {
                                    razorpay_order_id,
                                    razorpay_payment_id,
                                    razorpay_signature,
                                    amount,     // in ₹
                                },
                            ],
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )

                    // 4) Notify parent (or just navigate) so the wallet screen reloads
                    if (onSuccess) onSuccess()
                },
                prefill: {
                    // your user's name/email/contact here if you like
                },
            })
            rzp.open()
        } catch (err) {
            console.error('Payment init error', err)
            alert(err.message || 'Could not start payment')
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePay}
            disabled={loading || !amount}
            className="w-full bg-orange-400 text-white py-2 rounded disabled:opacity-50"
        >
            {loading ? 'Processing…' : `Pay ₹${amount.toFixed(2)}`}
        </button>
    )
}
