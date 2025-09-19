import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaFileInvoice,
  FaDownload,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CustomerApply = () => {
  const [documents, setDocuments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  // Fetch user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.user_id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch documents & certificates
  useEffect(() => {
    if (!userId) return;

    const allowedStatuses = [
      "Received",
      "Pending",
      "Approved",
      "Rejected",
      "Uploaded",
    ];
    axios
<<<<<<< Updated upstream
      .get("https://maze-backend-production.up.railway.app/documents/list")
=======
      .get("http://maze-backend-production.up.railway.app/documents/list")
>>>>>>> Stashed changes
      .then((response) => {
        const allDocs = response.data.documents;
        const filtered = allDocs
          .filter(
            (doc) =>
              doc.user_id === userId && allowedStatuses.includes(doc.status)
          )
          .reverse();
        setDocuments(filtered);
      })
      .catch((err) => console.error("Error fetching documents:", err));

    axios
<<<<<<< Updated upstream
      .get("https://maze-backend-production.up.railway.app/certificates")
=======
      .get("http://maze-backend-production.up.railway.app/certificates")
>>>>>>> Stashed changes
      .then((res) => setCertificates(res.data))
      .catch((err) => console.error("Error fetching certificates:", err));
  }, [userId]);

  // Helpers & handlers (unchanged)
  const filteredDocuments = documents.filter((doc) => {
    const searchString = [
      doc.user_id,
      doc.document_id,
      doc.category_name,
      doc.subcategory_name,
      doc.name,
      doc.email,
      doc.phone,
      doc.address,
      doc.application_id,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter
      ? doc.status.toLowerCase() === statusFilter.toLowerCase()
      : true;
    return matchesSearch && matchesStatus;
  });

  const getCertificateByDocumentId = (id) =>
    certificates.find((c) => c.document_id === id);

  const handleView = (documentId, categoryId, subcategoryId) =>
    navigate(`/Customerview/${documentId}`, {
      state: { categoryId, subcategoryId },
    });

  const handleViewInvoice = (documentId, categoryId, subcategoryId) =>
    navigate(`/Customerinvoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });

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
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Swal.fire(
        "Error",
        "Failed to download receipt. Please try again.",
        "error"
      );
    }
  };

  const handleViewCertificate = async (documentId) => {
    const cert = getCertificateByDocumentId(documentId);
    if (!cert) {
      Swal.fire("Error", "Certificate not found.", "error");
      return;
    }
    try {
      const { data } = await axios.get(
<<<<<<< Updated upstream
        `https://maze-backend-production.up.railway.app/certificates/${cert.certificate_id}`
=======
        `http://maze-backend-production.up.railway.app/certificates/${cert.certificate_id}`
>>>>>>> Stashed changes
      );
      if (data.file_url) window.open(data.file_url, "_blank");
      else throw new Error("No file URL");
    } catch (error) {
      console.error("Error fetching certificate:", error);
      Swal.fire("Error", "Failed to fetch certificate.", "error");
    }
  };

  // NEW: navigate to receipt-error page
  const handleReportReceiptError = (doc) =>
    navigate("/Adderrorrequest", {
      state: {
        documentId: doc.document_id,
        applicationId: doc.application_id,
        distributorId: doc.distributor_id,
        userId: doc.user_id,
        categoryId: doc.category_id,
        subcategoryId: doc.subcategory_id,
        name: doc.name,
        email: doc.email,
      },
    });

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Applications List
          </h2>
          <button
            onClick={() => navigate("/Cdashinner")}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 flex justify-end items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded-md focus:outline-none focus:ring w-64 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded-md focus:outline-none focus:ring text-sm"
          >
            <option value="">All Status</option>
            {["Received", "Pending", "Approved", "Rejected", "Uploaded"].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {[
                  "Sr.No",
                  "Application ID",
                  "Applicant Name",
                  "Datetime",
                  "Category",
                  "Subcategory",
                  "VLE Name",
                  "VLE Email",
                  "VLE Phone no",
                  "Action",
                  "View",
                  "Documents",
                  "Verification",
                  "Download Receipt",
                  "Certificate",
                  "Report Receipt Error", // ← new header
                ].map((hdr) => (
                  <th
                    key={hdr}
                    className="px-4 py-3 border text-center font-semibold"
                  >
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, idx) => (
                  <tr
                    key={doc.document_id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"}
                  >
                    {/* existing columns unchanged... */}
                    <td className="border px-4 py-3 text-center">{idx + 1}</td>
                    <td className="border px-4 py-3 text-center">
                      {doc.application_id}
                    </td>
                    <td className="border px-4 py-2">
                      {Array.isArray(doc.document_fields)
                        ? doc.document_fields.find(
                            (f) => f.field_name === "APPLICANT NAME"
                          )?.field_value || "-"
                        : doc.document_fields["APPLICANT NAME"] || "-"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {doc.category_name}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {doc.subcategory_name}
                    </td>
                    <td className="border px-4 py-3 text-center">{doc.name}</td>
                    <td className="border px-4 py-3 text-center">
                      {doc.email}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {doc.phone}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleViewInvoice(doc.document_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaFileInvoice className="inline-block mr-1" />
                        Action
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleView(doc.document_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        <FaFileInvoice className="inline-block mr-1" />
                        View
                      </button>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {doc.documents?.map((f, i) => (
                          <a
                            key={i}
                            href={f.file_path}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FaFileAlt className="text-blue-500 text-xl" />
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            doc.status === "Approved"
                              ? "bg-green-500"
                              : doc.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {(doc.status === "Received" ||
                        doc.status === "Uploaded") &&
                      doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          <FaDownload className="inline-block mr-1" />
                          Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>

                    <td className="border px-4 py-3 text-center">
                      {doc.status === "Completed" &&
                      getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          <FaCheck className="inline-block mr-1" />
                          Certificate
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )}
                    </td>

                    {/* ← NEW: only show if receipt_url exists */}
                    <td className="border px-4 py-3 text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() => handleReportReceiptError(doc)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          <FaExclamationTriangle className="inline-block mr-1" />
                          Report Receipt Error
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No documents found.
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

export default CustomerApply;
