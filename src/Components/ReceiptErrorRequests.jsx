// src/pages/ReceiptErrorRequests.jsx

import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ReceiptErrorRequests = () => {
    const [errorRequests, setErrorRequests] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");    // new
    const navigate = useNavigate();

    useEffect(() => {
        fetchErrorRequests();
        fetchReceipts();
    }, []);

    const fetchErrorRequests = async () => {
        try {
            const { data } = await axios.get("https://mazedakhale.in/api/request-errors");
            setErrorRequests(data);
        } catch (err) {
            console.error("Error fetching error requests:", err);
        }
    };

    const fetchReceipts = async () => {
        try {
            const { data } = await axios.get("https://mazedakhale.in/api/receipts");
            setReceipts(data);
        } catch (err) {
            console.error("Error fetching receipts:", err);
        }
    };

    const getCorrectReceiptId = (documentId) =>
        receipts.find((r) => r.document_id === documentId)?.receipt_id || null;

    const handleViewCorrectReceipt = async (documentId) => {
        const id = getCorrectReceiptId(documentId);
        if (!id) {
            Swal.fire("Error", "No valid receipt found.", "error");
            return;
        }
        try {
            const { data } = await axios.get(`https://mazedakhale.in/api/receipts/${id}`);
            if (data.file_url) {
                window.open(data.file_url, "_blank");
            } else {
                Swal.fire("Error", "Receipt URL missing.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to fetch receipt.", "error");
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        let rejectionReason = "";
        if (newStatus === "Rejected") {
            const { value } = await Swal.fire({
                title: "Enter Rejection Reason",
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Reject",
                inputValidator: (v) => (v.trim() ? null : "Reason required"),
            });
            if (!value) return;
            rejectionReason = value.trim();
        }

        setErrorRequests((rs) =>
            rs.map((r) =>
                r.request_id === requestId ? { ...r, request_status: newStatus } : r
            )
        );
        Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });

        try {
            await axios.patch(
                `https://mazedakhale.in/api/request-errors/update-status/${requestId}`,
                { request_status: newStatus, rejectionReason }
            );
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to update status.", "error");
            fetchErrorRequests();
        }
    };

    // Apply filters: error type, status, and search
    const filtered = errorRequests
        .filter((r) =>
            filterType === "all" ? true : r.error_type === filterType
        )
        .filter((r) =>
            statusFilter === "all" ? true : r.request_status === statusFilter
        )
        .filter((r) =>
            Object.values(r).some((v) =>
                v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

    return (
        <div className="ml-[300px] mt-[80px] p-6 w-[calc(100%-260px)] overflow-x-auto">
            <div className="relative bg-white shadow-lg rounded-lg border border-gray-300">
                {/* Header */}
                <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-center">Error Requests</h2>
                    <button
                        onClick={() => navigate("/Adashinner")}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div>

                    {/* Filters */}
                    <div className="p-4 flex items-center gap-4">
                        {/* Error Type */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Error Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="border p-2 rounded-md"
                            >
                                <option value="all">All</option>
                                <option value="certificate">Certificate</option>
                                <option value="receipt">Receipt</option>
                                <option value="payment">Payment</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border p-2 rounded-md"
                            >
                                <option value="all">All</option>
                                <option value="Pending">Pending</option>
                                <option value="Uploaded">Uploaded</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        {/* Search (small, right-aligned) */}
                        <div className="ml-auto w-48">
                            <label className="block text-sm font-semibold mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search…"
                                className="w-full border p-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                </div>

                {/* Table */}
                <div className="p-6">
                    <table className="w-full border border-[#776D6DA8] text-sm bg-white shadow-md rounded-md">
                        <thead className="bg-[#F58A3B14] border-b-2 border-[#776D6DA8]">
                            <tr>
                                {[
                                    "Request ID",
                                    "App ID",
                                    "Type",
                                    "Description",
                                    "Error Doc",
                                    "Doc ID",
                                    "User ID",
                                    "Dist ID",
                                    "Correct Receipt",
                                    "Status",
                                    "Date",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 border border-[#776D6DA8] text-center font-semibold"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map((r, i) => (
                                    <tr
                                        key={r.request_id}
                                        className={i % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"}
                                    >
                                        <td className="px-4 py-2 border text-center">{r.request_id}</td>
                                        <td className="px-4 py-2 border text-center">{r.application_id}</td>
                                        <td className="px-4 py-2 border text-center">{r.error_type}</td>
                                        <td className="px-4 py-2 border text-center">{r.request_description}</td>
                                        <td className="px-4 py-2 border text-center">
                                            <a
                                                href={r.error_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                View
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 border text-center">{r.document_id}</td>
                                        <td className="px-4 py-2 border text-center">{r.user_id}</td>
                                        <td className="px-4 py-2 border text-center">{r.distributor_id}</td>
                                        <td className="px-4 py-2 border text-center">
                                            {getCorrectReceiptId(r.document_id) ? (
                                                <button
                                                    onClick={() => handleViewCorrectReceipt(r.document_id)}
                                                    className="bg-green-500 text-white px-2 py-1 rounded"
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-white text-sm ${r.request_status === "Approved"
                                                    ? "bg-green-500"
                                                    : r.request_status === "Rejected"
                                                        ? "bg-red-500"
                                                        : r.request_status === "Uploaded"
                                                            ? "bg-purple-500"
                                                            : r.request_status === "Completed"
                                                                ? "bg-gray-500"
                                                                : "bg-yellow-500"
                                                    }`}
                                            >
                                                {r.request_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border text-center">
                                            {new Date(r.request_date).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 border text-center">
                                            <select
                                                className="border p-1 rounded"
                                                value={r.request_status}
                                                onChange={(e) =>
                                                    handleUpdateStatus(r.request_id, e.target.value)
                                                }
                                            >
                                                <option>Pending</option>
                                                <option>Uploaded</option>
                                                <option>Approved</option>
                                                <option>Rejected</option>
                                                <option>Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="py-4 border text-center">
                                        No matching error‐type requests.
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

export default ReceiptErrorRequests;
