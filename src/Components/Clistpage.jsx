import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import {
  FaFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const ClistPage = () => {
  const { state } = useLocation();
  const { categoryId, subcategoryId } = state || {};
  const navigate = useNavigate();
  // Core state
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // New state for category & subcategory names
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");

  // 1️⃣ Decode JWT once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  // 2️⃣ Fetch category & subcategory names
  useEffect(() => {
    if (categoryId) {
      axios
        .get(`http://localhost:3000/categories/${categoryId}`)
        .then((res) => setCategoryName(res.data.category_name))
        .catch((err) => console.error("Error loading category:", err));
    }
    if (subcategoryId) {
      axios
        .get(`http://localhost:3000/subcategories/${subcategoryId}`)
        .then((res) => setSubcategoryName(res.data.subcategory_name))
        .catch((err) => console.error("Error loading subcategory:", err));
    }
  }, [categoryId, subcategoryId]);

  // 3️⃣ Fetch documents by status & fetch certificates
  useEffect(() => {
    if (!userId) return;
    const allowedStatuses = [
      "Received",
      "Pending",
      "Approved",
      "Rejected",
      "Uploaded",
      "Completed",
      "Sent",
    ];

    // Fetch all documents for this user
    axios
      .get("http://localhost:3000/documents/list")
      .then((resp) => {
        const filtered = resp.data.documents
          .filter(
            (d) => d.user_id === userId && allowedStatuses.includes(d.status)
          )
          .reverse();
        setDocuments(filtered);
      })
      .catch((err) => console.error("Error fetching documents:", err));

    // Fetch certificates
    axios
      .get("http://localhost:3000/certificates")
      .then((resp) => setCertificates(resp.data))
      .catch((err) => console.error("Error fetching certificates:", err));
  }, [userId]);

  // 4️⃣ If categoryId & subcategoryId are provided, fetch that subset
  useEffect(() => {
    if (userId && categoryId && subcategoryId) {
      const url = `http://localhost:3000/documents/doc/${categoryId}/${subcategoryId}/${userId}`;
      axios
        .get(url)
        .then((resp) => setDocuments(resp.data))
        .catch((err) => console.error("Error fetching category docs:", err));
    }
  }, [userId, categoryId, subcategoryId]);

  // Handler: re-upload a file
  const handleReupload = (documentId, documentType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", documentType);

      try {
        const resp = await axios.post(
          `http://localhost:3000/documents/reupload/${documentId}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Reupload successful");
        setDocuments((docs) =>
          docs.map((d) =>
            d.document_id === documentId ? resp.data.document : d
          )
        );
      } catch (err) {
        console.error("Reupload failed:", err);
        alert(err.response?.data?.message || "Reupload failed");
      }
    };
    input.click();
  };

  // Handler: download receipt
  const handleDownloadReceipt = (url, name) => {
    const ext = url.split(".").pop();
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_receipt.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handler: view certificate
  const handleViewCertificate = async (docId) => {
    const cert = certificates.find((c) => c.document_id === docId);
    if (!cert) return alert("Certificate not found");
    try {
      const resp = await axios.get(
        `http://localhost:3000/certificates/${cert.certificate_id}`
      );
      window.open(resp.data.file_url, "_blank");
    } catch (err) {
      console.error("Fetch cert failed:", err);
      alert("Failed to load certificate");
    }
  };

  // Helper: find cert by doc ID
  const getCertificateByDocumentId = (docId) =>
    certificates.find((c) => c.document_id === docId);

  // Handler: navigate to invoice view
  const handleViewInvoice = (docId) => {
    navigate(`/Customerinvoice/${docId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  // Handler: navigate to view details
  const handleView = (docId) => {
    navigate(`/View/${docId}`, { state: { categoryId, subcategoryId } });
  };

  // Search filter
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = Object.values(doc).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Date formatting
  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${dd}-${mm}-${yyyy} ${time}`;
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6">
      <div className="w-[90%] max-w-6xl shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-white p-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Completed Applications
          </h2>
          {categoryName && subcategoryName && (
            <p className="mt-1 text-center text-gray-600">
              Documents for:{" "}
              <span className="font-semibold">{categoryName}</span> →{" "}
              <span className="font-semibold">{subcategoryName}</span>
            </p>
          )}
          <button
            onClick={() => navigate("/Cdashinner")}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 flex justify-end items-center gap-4 bg-white">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-orange-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 w-64 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 text-sm"
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Uploaded</option>
            <option>Received</option>
            <option>Completed</option>
            <option>Sent</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white p-4">
          <table className="min-w-full border border-gray-300 text-sm">
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
                  "VLE Phone",
                  "Action",
                  "View",
                  "Documents",
                  "Verification",
                  "Download Receipt",
                  "Certificate",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 border border-gray-300 text-center font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, idx) => (
                  <tr
                    key={doc.document_id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"
                    } hover:bg-orange-100`}
                  >
                    <td className="px-4 py-2 border text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border text-center">
                      {doc.application_id}
                    </td>
                    <td className="px-4 py-2 border">
                      {(() => {
                        const fld = Array.isArray(doc.document_fields)
                          ? doc.document_fields.find(
                              (f) => f.field_name === "APPLICANT NAME"
                            )
                          : {
                              field_value:
                                doc.document_fields?.["APPLICANT NAME"],
                            };
                        return (
                          fld?.field_value || (
                            <span className="text-gray-500">—</span>
                          )
                        );
                      })()}
                    </td>
                    <td className="border p-2 text-center">
                      {(() => {
                        const date = new Date(doc.uploaded_at);
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
                    <td className="px-4 py-2 border text-center">
                      {doc.category_name}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {doc.subcategory_name}
                    </td>
                    <td className="px-4 py-2 border text-center">{doc.name}</td>
                    <td className="px-4 py-2 border text-center">
                      {doc.email}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {doc.phone}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleViewInvoice(doc.document_id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center justify-center"
                      >
                        <FaFileInvoice className="mr-1" /> Action
                      </button>
                    </td>

                    {/* View */}
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleView(doc.document_id)}
                        className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center justify-center"
                      >
                        <FaFileInvoice className="mr-1" /> View
                      </button>
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-2 border text-center">
                      <div className="flex justify-center space-x-2">
                        {doc.documents?.map((f, i) => (
                          <a
                            key={i}
                            href={f.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaFileAlt className="text-blue-500 text-xl" />
                          </a>
                        ))}
                      </div>
                    </td>

                    {/* Verification status */}
                    <td className="px-4 py-2 border text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white ${
                          doc.status === "Approved"
                            ? "bg-green-500"
                            : doc.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    {/* Download Receipt */}
                    <td className="px-4 py-2 border text-center">
                      {["Received", "Uploaded"].includes(doc.status) &&
                      doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 flex items-center justify-center"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Certificate */}
                    <td className="px-4 py-2 border text-center">
                      {doc.status === "Completed" &&
                      getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() => handleViewCertificate(doc.document_id)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex items-center justify-center text-xs"
                        >
                          <FaCheck className="mr-1" /> Certificate
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
                    colSpan="15"
                    className="px-4 py-6 border text-center text-gray-500"
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

export default ClistPage;
