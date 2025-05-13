// src/pages/ErrorRequests.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaTimes, FaCheck } from "react-icons/fa";
const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [assignedDocs, setAssignedDocs] = useState([]); // ← new
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState({});
  const navigate = useNavigate();

  const distributorId =
    jwtDecode(localStorage.getItem("token"))?.user_id || null;

  useEffect(() => {
    if (!distributorId) return;
    fetchErrorRequests();
    fetchCertificates();
    fetchAssignedDocuments(); // ← new
  }, [distributorId]);

  const fetchErrorRequests = async () => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/request-errors/distributor/${distributorId}`
      );
      setErrorRequests(
        data.filter(
          (r) =>
            r.request_status !== "Distributor Rejected" &&
            r.request_status !== "Completed"
        )
      );
    } catch (err) {
      console.error("Error fetching error requests:", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get(
        "https://mazedakhale.in/api/certificates"
      );
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  // ← new: fetch your distributor’s documents so we can read the fields
  const fetchAssignedDocuments = async () => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/documents/list/${distributorId}`
      );
      setAssignedDocs(data.documents);
    } catch (err) {
      console.error("Error fetching assigned documents:", err);
    }
  };

  // ← new helper to pull “APPLICANT NAME” out of that document’s fields
  const getApplicantName = (req) => {
    const doc = assignedDocs.find((d) => d.document_id === req.document_id);
    if (!doc) return "-";
    const f = doc.document_fields;
    if (Array.isArray(f)) {
      const entry = f.find((x) => x.field_name === "APPLICANT NAME");
      return entry?.field_value ?? "-";
    }
    return f?.["APPLICANT NAME"] ?? "-";
  };

  const handleReject = async (requestId) => {
    const { value: reason } = await Swal.fire({
      title: "Rejection Reason",
      input: "text",
      showCancelButton: true,
      inputValidator: (v) => (!v.trim() ? "Reason required" : null),
    });
    if (!reason) return;
    try {
      await axios.patch(
        `https://mazedakhale.in/api/request-errors/update-status/${requestId}`,
        { request_status: "Distributor Rejected", rejectionReason: reason }
      );
      await fetchErrorRequests();
      Swal.fire("Rejected!", "", "success");
    } catch {
      Swal.fire("Error", "Failed to reject.", "error");
    }
  };

  const handleDownloadReceipt = async (applicationId) => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/documents/receipt/${applicationId}`
      );
      const url = data.receipt_url;
      if (!url) throw new Error("No receipt available");
      const ext = url.split(".").pop().split(/[?#]/)[0];
      const filename = `${data.application_id}_receipt.${ext}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to download receipt.",
        "error"
      );
    }
  };

  const handleDownloadCertificate = async (applicationId) => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/certificates/certificate/${applicationId}`
      );
      const url = data.certificate_url;
      if (!url) throw new Error("No certificate available");
      const ext = url.split(".").pop().split(/[?#]/)[0];
      const filename = `${data.application_id}_certificate.${ext}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to download certificate.",
        "error"
      );
    }
  };

  const handleFileChange = (e, docId) => {
    setSelectedFile((prev) => ({ ...prev, [docId]: e.target.files[0] }));
  };

  const handleUpload = async (req, type) => {
    const file = selectedFile[req.document_id];
    if (!file) return Swal.fire("Error", "Please select a file.", "error");

    const formData = new FormData();
    formData.append(type === "certificate" ? "file" : "receipt", file);
    if (type === "certificate") formData.append("user_id", distributorId);

    const url =
      type === "certificate"
        ? `https://mazedakhale.in/api/certificates/update/${req.document_id}`
        : `https://mazedakhale.in/api/documents/update-receipt/${req.document_id}`;
    const method = type === "certificate" ? "patch" : "put";

    try {
      await axios[method](url, formData);
      await axios.patch(
        `https://mazedakhale.in/api/request-errors/update-status/${req.request_id}`,
        {
          request_status:
            type === "certificate" ? "Uploaded" : "Receipt Uploaded",
        }
      );
      await fetchErrorRequests();
      Swal.fire("Uploaded!", "", "success");
    } catch {
      Swal.fire("Error", `Failed to upload ${type}.`, "error");
    }
  };

  const filtered = errorRequests
    .filter((r) => (filterType === "all" ? true : r.error_type === filterType))
    .filter((r) =>
      statusFilter === "all" ? true : r.request_status === statusFilter
    )
    .filter((r) =>
      Object.values(r).some((v) =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-center">
            Manage Error Requests
          </h2>
          <button
            onClick={() => navigate("/Ddashinner")}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 flex items-center gap-4">
          <select
            className="border p-2 rounded-md"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="certificate">Certificate</option>
            <option value="receipt">Receipt</option>
            <option value="payment">Payment</option>
          </select>
          <select
            className="border p-2 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option>Pending</option>
            <option>Uploaded</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Receipt Uploaded</option>
          </select>
          <input
            className="ml-auto border p-2 rounded-md w-64"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "Req ID",
                  "App ID",
                  "Applicant",
                  "Type",
                  "Desc",
                  "Doc",
                  "Status",
                  "Date",
                  "Reject",
                  "Download",
                  "Upload",
                ].map((h) => (
                  <th key={h} className="border p-2 text-center font-semibold">
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
                    <td className="border p-2 text-center">{r.request_id}</td>
                    <td className="border p-2 text-center">
                      {r.application_id}
                    </td>
                    <td className="border p-2 text-center">
                      {getApplicantName(r)} {/* ← your new column */}
                    </td>
                    <td className="border p-2 text-center">{r.error_type}</td>
                    <td className="border p-2 text-center">
                      {r.request_description}
                    </td>
                    <td className="border p-2 text-center">
                      <a
                        href={r.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View
                      </a>
                    </td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-sm ${
                          r.request_status === "Approved"
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
                    <td className="border p-2 text-center">
                      {(() => {
                        const date = new Date(r.request_date);
                        const formattedDate = `${String(
                          date.getDate()
                        ).padStart(2, "0")}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}-${date.getFullYear()}`;
                        const formattedTime = date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        });
                        return (
                          <>
                            <div>{formattedDate}</div>
                            <div className="text-sm text-gray-600">
                              {formattedTime}
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleReject(r.request_id)}
                      >
                        Reject
                      </button>
                    </td>
                    <td className="border p-2 text-center">
                      {r.error_type === "certificate" ? (
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded flex items-center justify-center"
                          onClick={() =>
                            handleDownloadCertificate(r.application_id)
                          }
                        >
                          <FaCheck className="mr-1" /> Cert
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded flex items-center justify-center"
                          onClick={() =>
                            handleDownloadReceipt(r.application_id)
                          }
                        >
                          <FaDownload className="mr-1" /> Rec
                        </button>
                      )}
                    </td>
                    <td className="border p-2">
                      <input
                        type="file"
                        className="mb-1"
                        onChange={(e) => handleFileChange(e, r.document_id)}
                      />
                      <button
                        className="bg-blue-500 text-white px-2 rounded"
                        onClick={() => handleUpload(r, r.error_type)}
                      >
                        Upload
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-4">
                    No requests found.
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

export default ErrorRequests;
