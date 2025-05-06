// src/pages/ReceiptErrorRequests.jsx
import React, { useEffect, useState } from "react";
import { FaTimes, FaDownload, FaCheck } from "react-icons/fa";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ReceiptErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // On mount, verify token and fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      jwtDecode(token);
      fetchAll();
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, []);

  const fetchAll = () => {
    fetchErrorRequests();
    fetchUsers();
    fetchDistributors();
  };

  const fetchErrorRequests = async () => {
    try {
      const { data } = await axios.get(
        "https://mazedakhale.in/api/request-errors"
      );
      setErrorRequests(data);
    } catch (err) {
      console.error("Error fetching error requests:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        "https://mazedakhale.in/api/users/register"
      );
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchDistributors = async () => {
    try {
      const { data } = await axios.get(
        "https://mazedakhale.in/api/users/distributors"
      );
      setDistributors(data);
    } catch (err) {
      console.error("Error fetching distributors:", err);
    }
  };

  const getUserNameById = (id) => {
    const u = users.find(
      (x) => String(x.user_id) === String(id) || String(x.id) === String(id)
    );
    return u ? u.name || u.full_name || u.username : id;
  };

  const getDistributorNameById = (id) => {
    const d = distributors.find(
      (x) =>
        String(x.distributor_id) === String(id) || String(x.id) === String(id)
    );
    return d ? d.name || d.company_name : id;
  };

  // Download receipt
  const handleDownloadReceipt = async (applicationId) => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api//documents/receipt/${applicationId}`
      );
      const url = data.receipt_url;
      const appId = data.application_id;
      if (!url) {
        return Swal.fire("Error", "No receipt available.", "error");
      }
      const ext = url.split(".").pop().split(/[?#]/)[0];
      const filename = `${appId}_receipt.${ext}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading receipt:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to download receipt.",
        "error"
      );
    }
  };

  // Download certificate
  const handleDownloadCertificate = async (applicationId) => {
    try {
      const { data } = await axios.get(
        `https://mazedakhale.in/api/certificates/certificate/${applicationId}`
      );
      const url = data.certificate_url;
      const appId = data.application_id;
      if (!url) {
        return Swal.fire("Error", "No certificate available.", "error");
      }
      const ext = url.split(".").pop().split(/[?#]/)[0];
      const filename = `${appId}_certificate.${ext}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading certificate:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to download certificate.",
        "error"
      );
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

    setErrorRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId ? { ...r, request_status: newStatus } : r
      )
    );
    Swal.fire({
      icon: "success",
      title: "Updated!",
      timer: 1500,
      showConfirmButton: false,
    });

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
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Error requests lits{" "}
          </h2>
          <button
            onClick={() => navigate("/Adashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 flex items-center gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Error Type
            </label>
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
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="all">All</option>
              <option>Pending</option>
              <option>Uploaded</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Completed</option>
            </select>
          </div>
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

        {/* Table */}
        <div className="p-6 overflow-x-auto">
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
                  "Applicant",
                  "Distributor",
                  "Download",
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
                    <td className="px-4 py-2 border text-center">
                      {r.request_id}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {r.application_id}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {r.error_type}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {r.request_description}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      <a
                        href={r.error_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View
                      </a>
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {r.document_id}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {getUserNameById(r.user_id)}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {getDistributorNameById(r.distributor_id)}
                    </td>
                    <td className="px-4 py-2	border text-center">
                      {r.error_type === "certificate" ? (
                        <button
                          onClick={() =>
                            handleDownloadCertificate(r.application_id)
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded flex items-center justify-center hover:bg-green-600 transition"
                        >
                          <FaCheck className="mr-1" /> Download Cert
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(r.application_id)
                          }
                          className="bg-blue-500 text-white px-2 py-1 rounded flex items-center justify-center hover:bg-blue-600 transition"
                        >
                          <FaDownload className="mr-1" /> Download Rec
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2	border text-center">
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
                    <td className="px-4 py-2	border text-center">
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
                  <td colSpan={12} className="py-4	border text-center">
                    No matching requests.
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
