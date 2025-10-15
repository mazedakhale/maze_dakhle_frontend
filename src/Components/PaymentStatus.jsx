// src/components/PaymentStatus.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentStatus() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Checking…");
  const [details, setDetails] = useState(null);
  const [callbackFired, setCallbackFired] = useState(false);
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const params = new URLSearchParams(search);
    const merchantOrderId = params.get("merchantOrderId");
    if (!merchantOrderId) {
      setStatus("No order ID provided");
      return;
    }
    if (!token) {
      setStatus("Not authenticated");
      return;
    }

    const statusUrl = import.meta.env.DEV
      ? `http://localhost:3000/payment/status?merchantOrderId=${merchantOrderId}`
      : `/payment/status?merchantOrderId=${merchantOrderId}`;

    const interval = setInterval(() => {
      axios
        .get(statusUrl, { headers })
        .then((res) => {
          const raw = res.data;

          // Normalize top-level amount (paise → ₹), leave detail.amount untouched
          const normalized = {
            ...raw,
            amount: raw.amount / 100,
            paymentDetails: Array.isArray(raw.paymentDetails)
              ? raw.paymentDetails
              : [],
          };

          setDetails(normalized);
          setStatus(normalized.state || "UNKNOWN");

          // Fire callback exactly once when we see COMPLETED
          if (
            normalized.state.toUpperCase() === "COMPLETED" &&
            !callbackFired
          ) {
            const txId = normalized.paymentDetails[0]?.transactionId;
            if (txId) {
              const cbUrl = import.meta.env.DEV
                ? `http://localhost:3000/payment/callback`
                : `/payment/callback`;

              axios
                .post(
                  cbUrl,
                  {
                    payload: {
                      merchantOrderId,
                      transactionId: txId,
                      state: normalized.state,
                      amount: normalized.amount,
                      paymentDetails: normalized.paymentDetails,
                    },
                  },
                  { headers }
                )
                .then(() => setCallbackFired(true))
                .catch(console.error);
            }
          }

          // Stop polling once completed (or error)
          if (normalized.state.toUpperCase() === "COMPLETED") {
            clearInterval(interval);
          }
        })
        .catch((err) => {
          console.error("Error fetching payment status", err);
          setStatus(
            err.response?.status === 401
              ? "Unauthorized"
              : "Error fetching status"
          );
          clearInterval(interval);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [search, callbackFired, token]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="card p-4" style={{ width: "24rem" }}>
        <h5 className="card-title text-center mb-3">Payment Status</h5>

        {status === "COMPLETED" ? (
          <div className="alert alert-success text-center">
            ✅ Payment successful!
          </div>
        ) : (
          <p>
            <strong>State:</strong> {status}
          </p>
        )}

        {details && (
          <pre
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "4px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {JSON.stringify(details, null, 2)}
          </pre>
        )}

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={() => navigate("/wallet")}
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}
