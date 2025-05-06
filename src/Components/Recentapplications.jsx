import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaRegFileAlt, FaDownload, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const RecentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState(true); // for future use
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [distributors, setDistributors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all data in parallel
    const docsReq = axios.get("https://mazedakhale.in/api/documents/recent", {
      timeout: 120000,
    });
    const distReq = axios.get("https://mazedakhale.in/api/users/distributors");
    const certReq = axios.get("https://mazedakhale.in/api/certificates");
    const usersReq = axios.get("https://mazedakhale.in/api/users/register");

    Promise.all([docsReq, distReq, certReq, usersReq])
      .then(([docsResp, distResp, certResp, usersResp]) => {
        setApplications(docsResp.data);
        setDistributors(distResp.data);
        setCertificates(certResp.data);
        setUsers(usersResp.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Download receipt helper
  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const ext = receiptUrl.split(".").pop().toLowerCase();
      const fileName = `${documentName}_receipt.${ext}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      Swal.fire("Error", "Failed to download receipt.", "error");
    }
  };

  // Update status helper
  const handleUpdateStatus = async (documentId, newStatus) => {
    Swal.fire({
      title: "Updating...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
    try {
      await axios.put(
        `https://mazedakhale.in/api/documents/update-status/${documentId}`,
        { status: newStatus },
        { timeout: 30000 }
      );
      setApplications((apps) =>
        apps.map((doc) =>
          doc.document_id === documentId ? { ...doc, status: newStatus } : doc
        )
      );
      Swal.fire("Success", `Status set to ${newStatus}`, "success");
    } catch {
      Swal.fire("Error", "Unable to update status.", "error");
    }
  };

  const handleRejectWithReason = async (documentId) => {
    const { value: reason } = await Swal.fire({
      title: "Rejection Reason",
      input: "text",
      inputPlaceholder: "Why reject?",
      showCancelButton: true,
      inputValidator: (v) => !v && "Reason required",
    });
    if (reason) {
      try {
        await axios.put(
          `https://mazedakhale.in/api/documents/update-status/${documentId}`,
          { status: "Rejected", rejectionReason: reason }
        );
        setApplications((apps) =>
          apps.map((d) =>
            d.document_id === documentId
              ? { ...d, status: "Rejected", rejection_reason: reason }
              : d
          )
        );
        Swal.fire("Rejected", "Document has been rejected.", "success");
      } catch {
        Swal.fire("Error", "Failed to reject.", "error");
      }
    }
  };

  const getCertificateByDocumentId = (documentId) => {
    const cert = certificates.find((c) => c.document_id === documentId);
    return cert ? cert.certificate_id : null;
  };
  const getDistributorName = (distributorId) => {
    const u = users.find((u) => Number(u.user_id) === Number(distributorId));
    return u ? u.name : "";
  };

  // Combined status + search filtering
  const filteredDocs = applications
    .filter((doc) => {
      if (!statusFilter) return true;
      switch (statusFilter) {
        case "Received":
          return !!doc.receipt_url;
        case "Sent":
          return doc.status === "Sent";
        case "Uploaded":
          return doc.status === "Uploaded";
        default:
          return doc.status === statusFilter;
      }
    })
    .filter((doc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        doc.document_id.toString().includes(q) ||
        doc.name?.toLowerCase().includes(q) ||
        doc.email?.toLowerCase().includes(q) ||
        doc.category_name?.toLowerCase().includes(q) ||
        doc.subcategory_name?.toLowerCase().includes(q) ||
        doc.application_id?.toLowerCase().includes(q)
      );
    });

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="ml-[250px] p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-[90%] max-w-6xl bg-white rounded-lg shadow">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Recent Applications List
          </h2>
          <button
            onClick={() => navigate("/Adashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 flex justify-between items-center border-b border-gray-300">
          <div className="flex items-center space-x-4">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-orange-300 p-2 rounded-md focus:ring-2 focus:ring-orange-400 text-sm"
            >
              <option value="">All</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Sent">Sent</option>
              <option value="Uploaded">Uploaded</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            className="border border-orange-300 p-2 rounded-md focus:ring-2 focus:ring-orange-400 w-64 text-sm"
          />
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-300">
              <tr>
                {[
                  "Sr No.",
                  "Application Id",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "Applicant",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone",
                  "Distributor",
                  "Status",
                  "Completed / Rejected",
                  "View",
                  "Receipt",
                  "Certificate",
                ].map((h) => (
                  <th
                    key={h}
                    className="border p-2 text-center font-bold text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, i) => {
                const date = new Date(doc.uploaded_at);
                const day = String(date.getDate()).padStart(2, "0");
                const mon = String(date.getMonth() + 1).padStart(2, "0");
                const ym = `${day}-${mon}-${date.getFullYear()}`;
                const tm = date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                });

                return (
                  <tr
                    key={doc.document_id}
                    className={`border-t ${
                      i % 2 ? "bg-white" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2 text-center">
                      {doc.application_id}
                    </td>
                    <td className="border p-2 text-center">
                      <div>{ym}</div>
                      <div className="text-xs text-gray-600">{tm}</div>
                    </td>
                    <td className="border p-2">{doc.category_name}</td>
                    <td className="border p-2">{doc.subcategory_name}</td>
                    <td className="border px-4 py-2 text-sm">
                      {Array.isArray(doc.document_fields)
                        ? doc.document_fields.find(
                            (f) => f.field_name === "APPLICANT NAME"
                          )?.field_value || "—"
                        : doc.document_fields?.["APPLICANT NAME"] || "—"}
                    </td>
                    <td className="border p-2 break-words">{doc.name}</td>
                    <td className="border p-2 break-words">{doc.email}</td>
                    <td className="border p-2 break-words">{doc.phone}</td>
                    <td className="border p-2">
                      {getDistributorName(doc.distributor_id)}
                    </td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs ${
                          doc.status === "Approved"
                            ? "bg-green-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : doc.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(doc.document_id, "Completed")
                          }
                          className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 text-white text-xs flex items-center"
                        >
                          <FaCheck className="mr-1" /> Complete
                        </button>
                        <button
                          onClick={() =>
                            handleRejectWithReason(doc.document_id)
                          }
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white text-xs flex items-center"
                        >
                          <FaTimes className="mr-1" /> Reject
                        </button>
                      </div>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() =>
                          navigate(`/View/${doc.document_id}`, {
                            state: {
                              categoryId: doc.category_id,
                              subcategoryId: doc.subcategory_id,
                            },
                          })
                        }
                        className="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-600 text-white text-xs flex items-center"
                      >
                        <FaRegFileAlt className="mr-1" /> View
                      </button>
                    </td>
                    <td className="border p-3 text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-orange-500 px-3 py-1 rounded hover:bg-blue-600 text-white flex items-center"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          Not Available
                        </span>
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => {
                            const certId = getCertificateByDocumentId(
                              doc.document_id
                            );
                            window.open(
                              `https://mazedakhale.in/api/certificates/${certId}`,
                              "_blank"
                            );
                          }}
                          className="bg-green-500 px-3 py-1 rounded hover:bg-blue-600 text-white text-xs flex items-center"
                        >
                          <FaCheck className="mr-1" /> Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentApplications;
