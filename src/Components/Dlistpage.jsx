import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFileInvoice, FaDownload, FaTimes } from "react-icons/fa";
import axios from "axios";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
const DlistPage = () => {
  const { state } = useLocation();
  const { categoryId, subcategoryId } = state || {};
  const navigate = useNavigate();

  // Core state
  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [distributorId, setDistributorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // New state for names
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");

  // Extract distributor ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setDistributorId(decoded.user_id);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  // Fetch category & subcategory names
  useEffect(() => {
    if (categoryId) {
      axios
        .get(`https://mazedakhale.in/api/categories/${categoryId}`)
        .then((res) => setCategoryName(res.data.category_name))
        .catch((err) => console.error("Error loading category:", err));
    }
    if (subcategoryId) {
      axios
        .get(`https://mazedakhale.in/api/subcategories/${subcategoryId}`)
        .then((res) => setSubcategoryName(res.data.subcategory_name))
        .catch((err) => console.error("Error loading subcategory:", err));
    }
  }, [categoryId, subcategoryId]);

  // Fetch documents & certificates
  useEffect(() => {
    if (!categoryId || !subcategoryId || !distributorId) return;

    const url = `https://mazedakhale.in/api/documents/${categoryId}/${subcategoryId}?distributorId=${distributorId}`;
    axios
      .get(url)
      .then((resp) => {
        const sorted = resp.data.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setDocuments(sorted);
      })
      .catch((err) => console.error("Error fetching documents:", err));

    axios
      .get("https://mazedakhale.in/api/certificates")
      .then((resp) => setCertificates(resp.data))
      .catch((err) => console.error("Error fetching certificates:", err));
  }, [categoryId, subcategoryId, distributorId]);

  // Helpers
  const getCertificateByDocumentId = (id) =>
    certificates.find((c) => c.document_id === id);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  const filteredDocuments = documents
    .filter((doc) =>
      Object.values(doc)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .filter((doc) =>
      statusFilter === "All" ? true : doc.status === statusFilter
    );

  const handleDownloadReceipt = (url, name) => {
    const ext = url.split(".").pop();
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_receipt.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadCertificate = async (docId, name) => {
    const cert = getCertificateByDocumentId(docId);
    if (!cert) return Swal.fire("Error", "Certificate not found.", "error");
    try {
      const resp = await axios.get(
        `https://mazedakhale.in/api/certificates/${cert.certificate_id}`
      );
      const link = document.createElement("a");
      link.href = resp.data.file_url;
      link.download = `${name}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to download certificate.", "error");
    }
  };

  const handleViewInvoice = (id) => navigate(`/Distributorinvoice/${id}`);
  const handleView = (id) => navigate(`/Distributorview/${id}`);

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Documents for:{" "}
            <span className="text-orange-600">{categoryName}</span>
            {" → "}
            <span className="text-orange-600">{subcategoryName}</span>
          </h2>
          <button
            onClick={() => navigate("/Ddashinner")}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 flex justify-between items-center bg-white">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64 p-2 border rounded focus:ring-2 focus:ring-orange-300"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="p-2 border rounded focus:ring-2 focus:ring-orange-300"
          >
            {[
              "All",
              "Approved",
              "Uploaded",
              "Pending",
              "Rejected",
              "Received",
              "Sent",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto bg-white">
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-[#F58A3B14] border-b-2">
              <tr>
                {[
                  "Application ID",
                  "Category",
                  "Subcategory",
                  "Status",
                  "Uploaded At",
                  "Action",
                  "View",
                  "Receipt",
                  "Certificate",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 border text-center font-semibold"
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
                    <td className="px-4 py-2 border text-center">
                      {doc.application_id}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {categoryName}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {subcategoryName}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {doc.status}
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
                      <button
                        onClick={() => handleViewInvoice(doc.document_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center justify-center"
                      >
                        <FaFileInvoice className="mr-1" /> Action
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleView(doc.document_id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {doc.receipt_url ? (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(doc.receipt_url, doc.name)
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center justify-center"
                        >
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {getCertificateByDocumentId(doc.document_id) ? (
                        <button
                          onClick={() =>
                            handleDownloadCertificate(doc.document_id, doc.name)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center justify-center"
                        >
                          <FaDownload className="mr-1" /> Certificate
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
                    colSpan="10"
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

export default DlistPage;
