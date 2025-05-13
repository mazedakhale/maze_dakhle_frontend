// src/components/TransactionTable.jsx
import React from "react";

export default function TransactionTable({ transactions = [] }) {
  if (!transactions.length) {
    return <p className="text-center py-4">No transactions to show.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Time
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Txn ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount (₹)
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-4 py-2 whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {tx.merchantOrderId}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {tx.transactionId || "—"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{tx.type}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                {Number(tx.amount).toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{tx.status}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {Array.isArray(tx.paymentDetails) &&
                tx.paymentDetails.length > 0 ? (
                  <details className="cursor-pointer">
                    <summary className="text-blue-600 underline">View</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(tx.paymentDetails, null, 2)}
                    </pre>
                  </details>
                ) : (
                  <span className="italic text-gray-500">None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
