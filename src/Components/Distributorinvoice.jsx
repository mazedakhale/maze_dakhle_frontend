import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import getEmbeddableUrl from "../utils/getEmbeddableUrl";
import { FaUserCircle, FaDownload, FaTimes, FaFileAlt } from "react-icons/fa";
import Draggable from "react-draggable";
import Swal from "sweetalert2";
import logo1 from "../assets/logo.png";

const InvoicePage = () => {
  const { documentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const nodeRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);

  // state
  const [documentData, setDocumentData] = useState(null);
  const [documentNames, setDocumentNames] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openContainer, setOpenContainer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState(null);
  const [previewReceiptFile, setPreviewReceiptFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // pull category/subcategory from location.state if present
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } =
    location.state || {};

  // --- Handlers for selecting & previewing files ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewFile(URL.createObjectURL(file));
      setShowPreview(true);
    }
  };
  const handleCancelFile = () => {
    previewFile && URL.revokeObjectURL(previewFile);
    setSelectedFile(null);
    setPreviewFile(null);
    setShowPreview(false);
  };
  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedReceiptFile(file);
      setPreviewReceiptFile(URL.createObjectURL(file));
      setShowPreview(true);
    }
  };
  const handleCancelReceiptFile = () => {
    previewReceiptFile && URL.revokeObjectURL(previewReceiptFile);
    setSelectedReceiptFile(null);
    setPreviewReceiptFile(null);
    setShowPreview(false);
  };

  // --- Upload receipt ---
  const handleUploadReceipt = async () => {
    if (!selectedReceiptFile) {
      Swal.fire("Warning", "Please select a receipt file first", "warning");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(selectedReceiptFile.type)) {
      Swal.fire("Error", "Only JPEG, PNG, and PDF allowed", "error");
      return;
    }
    if (selectedReceiptFile.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Max size is 5MB", "error");
      return;
    }

    Swal.fire({
      title: "Uploading receipt...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const form = new FormData();
    form.append("receipt", selectedReceiptFile);
    form.append("document_id", documentId);

    try {
      await axios.post(
        ` http://72.60.206.65:3000/documents/upload-receipt/${documentId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
      );
      await axios.put(
        ` http://72.60.206.65:3000/documents/update-status/${documentId}`,
        { status: "Sent" },
        { timeout: 30000 }
      );
      Swal.close();
      Swal.fire("Success", "Receipt uploaded!", "success").then(() =>
        navigate("/Distributorverify")
      );
      handleCancelReceiptFile();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        "Failed to upload receipt. Please try again.",
        "error"
      );
      console.error(err);
    }
  };
  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
  };
  // --- Upload certificate ---
  const handleUploadCertificate = async () => {
    if (!selectedFile) {
      Swal.fire("Warning", "Please select a file first", "warning");
      return;
    }
    if (
      !documentData?.user_id ||
      !documentData.distributor_id ||
      !documentData.application_id ||
      !documentData.name
    ) {
      Swal.fire("Error", "Required document info missing", "error");
      return;
    }

    Swal.fire({
      title: "Uploading certificate...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("document_id", documentId);
    form.append("user_id", documentData.user_id);
    form.append("distributor_id", documentData.distributor_id);
    form.append("application_id", documentData.application_id);
    form.append("name", documentData.name);

    try {
      // 1️⃣ Upload the cert file
      await axios.post(" http://72.60.206.65:3000/certificates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      // 2️⃣ THEN update the document status
      await axios.put(
        ` http://72.60.206.65:3000/documents/update-status/${documentId}`,
        { status: "Uploaded" },
        { timeout: 30000 }
      );

      Swal.close();
      Swal.fire(
        "Success",
        "Certificate uploaded & status set to “Uploaded”!",
        "success"
      ).then(() => navigate("/Distributorverify"));

      handleCancelFile();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to upload certificate",
        "error"
      );
      console.error(err);
    }
  };

  // --- Unified download all ---
  const handleDownloadAllDocuments = async () => {
    setIsLoading(true);
    Swal.fire({
      title: "Preparing download...",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await axios.get(
        ` http://72.60.206.65:3000/download/all/${documentId}`,
        {
          responseType: "blob",
          timeout: 120000,
          onDownloadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded * 100) / e.total);
              Swal.update({ text: `${pct}% complete` });
            }
          },
        }
      );
      // close loading
      Swal.close();

      // determine filename
      let filename = "";
      const cd = response.headers["content-disposition"];
      if (cd) {
        const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
        if (m && m[1]) filename = m[1].replace(/['"]/g, "");
      }
      if (!filename) {
        const fld = Array.isArray(documentData.document_fields)
          ? documentData.document_fields.find(
              (f) => f.field_name === "APPLICANT NAME"
            )
          : null;
        filename = fld?.field_value
          ? `${fld.field_value.replace(/\s+/g, "_")}.zip`
          : `Document_${documentId}.zip`;
      }

      // trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      Swal.fire("Success", "Documents downloaded successfully!", "success");
    } catch (error) {
      Swal.close();
      let msg = "Download failed. Please try again.";
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        msg = "Download timed out. Please try later.";
      } else if (error.response?.status === 404) {
        msg = "No files found for download.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      Swal.fire("Error", msg, "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Status update handler ---
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === "Rejected" && !rejectionReason.trim()) {
      return alert("Please enter a reason for rejection.");
    }
    setIsUpdatingStatus(true);
    Swal.fire({
      title: "Updating status...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        status: newStatus,
        rejectionReason,
        selectedDocumentNames: documentData.documents
          .filter((_, i) => checkedDocs[i])
          .map((doc) => documentNames[doc.document_type] || doc.document_type),
      };
      await axios.put(
        ` http://72.60.206.65:3000/documents/update-status/${documentId}`,
        payload,
        { timeout: 30000 }
      );
      Swal.close();
      Swal.fire("Success", "Status updated!", "success").then(() =>
        navigate("/Distributorverify")
      );
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update status",
        "error"
      );
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- Fetchers & effects ---
  const fetchCertificates = useCallback(async () => {
    try {
      const res = await axios.get(" http://72.60.206.65:3000/certificates", {
        timeout: 30000,
      });
      setCertificates(res.data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  }, []);

  const fetchDocumentData = useCallback(async () => {
    try {
      const res = await axios.get(
        ` http://72.60.206.65:3000/singledocument/documentby/${documentId}`
      );
      const doc = res.data.document;
      setDocumentData(doc);

      const cat = stateCategoryId || doc.category_id;
      const sub = stateSubcategoryId || doc.subcategory_id;
      if (cat && sub) {
        const fn = await axios.get(
          ` http://72.60.206.65:3000/field-names/${cat}/${sub}`
        );
        setDocumentNames(fn.data);
      }
    } catch (err) {
      console.error("Error fetching document data:", err);
    }
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  useEffect(() => {
    // get user email from JWT
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUserEmail(jwtDecode(token).email);
      } catch {}
    }
    axios
      .get(" http://72.60.206.65:3000/users/distributors")
      .then((r) => setDistributors(r.data))
      .catch(console.error);

    fetchCertificates();
    fetchDocumentData();
  }, [fetchCertificates, fetchDocumentData]);

  if (!documentData) {
    return <div className="text-center text-lg mt-10">Loading Invoice...</div>;
  }

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-[#00234E] text-white p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <img src={logo1} alt="Logo" className="h-10 mr-3" />
          <span className="text-xl font-bold">Vendor Management System</span>
        </div>
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          {/* Replace this block: */}

          {/* Cross button */}
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Ddashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
      </nav>

      <div className="flex space-x-6 mt-24">
        {/* LEFT PANEL */}
        <div className="w-4/5 border-r pr-6 h-[700px] overflow-y-auto">
          <div className="border rounded-lg shadow-lg p-6 bg-white">
            {/* Header with logo + title + date/app ID */}
            <div className="flex justify-between items-center mb-4">
              <img
                src={logo1}
                alt="Logo"
                className="w-24 h-24 object-contain"
              />
              <h2 className="text-xl font-bold text-gray-800 text-center">
                Manage Distributor List
              </h2>
              <table className="text-sm text-gray-700 border border-gray-300">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold pr-2 border-r p-2">Date:</td>
                    <td className="border p-2 text-center">
                      {formatDateTime(documentData.uploaded_at)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 border-r p-2">
                      Application ID:
                    </td>
                    <td className="p-2">{documentData.application_id}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="border-gray-400 mb-6" />

            {/* Category Header */}
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Application for {documentData.category_name}
            </h3>

            {/* Key-Value Fields */}
            <table className="w-full border border-gray-300 mb-6">
              <tbody>
                {[
                  {
                    label: "Application ID",
                    value: documentData.application_id,
                  },
                  { label: "Category", value: documentData.category_name },
                  {
                    label: "Subcategory",
                    value: documentData.subcategory_name,
                  },
                  { label: "Status", value: documentData.status },
                ]
                  .reduce((r, f, i, a) => {
                    if (i % 2 === 0) r.push(a.slice(i, i + 2));
                    return r;
                  }, [])
                  .map((pair, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      {pair.map(({ label, value }, j) => (
                        <React.Fragment key={j}>
                          <td
                            className="p-3 font-semibold border-r w-1/6"
                            style={{ backgroundColor: "#F58A3B14" }}
                          >
                            {label}
                          </td>
                          <td className="p-3 border-r">{value}</td>
                        </React.Fragment>
                      ))}
                      {pair.length < 2 && (
                        <>
                          <td className="p-3 border-r bg-white"></td>
                          <td className="p-3 border-r"></td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Document Fields */}
            <h3 className="text-2xl text-gray-700 font-semibold mb-4">
              Document Fields
            </h3>
            <table className="w-full table-fixed border border-gray-300">
              <tbody>
                {(() => {
                  let arr = [];
                  if (Array.isArray(documentData.document_fields)) {
                    arr = documentData.document_fields.map((f) => [
                      f.field_name,
                      f.field_value,
                    ]);
                  } else if (
                    documentData.document_fields &&
                    typeof documentData.document_fields === "object"
                  ) {
                    arr = Object.entries(documentData.document_fields);
                  }
                  return arr
                    .reduce((r, f, i, a) => {
                      if (i % 2 === 0) r.push(a.slice(i, i + 2));
                      return r;
                    }, [])
                    .map((pair, idx) => (
                      <tr key={idx} className="border-b border-gray-300">
                        {pair.map(([k, v], j) => (
                          <React.Fragment key={j}>
                            <td className="w-1/5 p-3 font-semibold border-r bg-white">
                              {k}
                            </td>
                            <td className="w-1/3 p-3 border-r">{v || "N/A"}</td>
                          </React.Fragment>
                        ))}
                        {pair.length < 2 && (
                          <>
                            <td className="w-1/5 p-3 bg-white border-r"></td>
                            <td className="w-1/3 p-3 border-r"></td>
                          </>
                        )}
                      </tr>
                    ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/5 mx-auto p-6 bg-white shadow-md rounded-lg">
          {/* Application Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-2 flex items-center">
              📋 Application Details
            </h2>
            <p className="text-gray-600">
              <strong>Application ID:</strong> {documentData.application_id}
            </p>
          </div>

          {/* Attached Documents */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Attached Documents
            </h3>
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 border border-gray-300 w-1/12"></th>
                  <th className="p-2 border border-gray-300 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                {documentData.documents?.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-300 text-center">
                      <input
                        type="checkbox"
                        checked={!!checkedDocs[i]}
                        onChange={() =>
                          setCheckedDocs((c) => ({ ...c, [i]: !c[i] }))
                        }
                      />
                    </td>
                    <td
                      className="p-2 border border-gray-300 text-blue-600 cursor-pointer hover:underline"
                      onClick={() =>{
                        setCheckedDocs((prev) => ({ ...prev, [i]: true }));
                        setPreviewFile(doc.file_path) || setShowPreview(true)}
                      }
                    >
                      {documentNames[doc.document_type] || doc.document_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reject + Download Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() =>
                setOpenContainer((o) =>
                  o === "rejection" ? null : "rejection"
                )
              }
              disabled={isUpdatingStatus}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
            >
              <FaTimes className="mr-2" /> Reject
            </button>
            <button
              onClick={handleDownloadAllDocuments}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center"
            >
              <FaDownload className="mr-2" />
              {isLoading ? "Downloading..." : "Download"}
            </button>
          </div>

          {/* Upload Receipt & Certificate */}
          <div className="flex space-x-4 mb-6">
            {/* Receipt */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Upload Receipt
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleReceiptFileChange}
                className="border p-2 rounded text-sm w-full"
              />
              {selectedReceiptFile && (
                <button
                  onClick={handleCancelReceiptFile}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleUploadReceipt}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mt-2 w-full"
              >
                <FaFileAlt className="mr-2" /> Upload Receipt
              </button>
              {documentData.receipt_url && (
                <button
                  onClick={() => {
                    const ext = documentData.receipt_url.split(".").pop();
                    const name = `${
                      documentData.name || "document"
                    }_receipt.${ext}`;
                    const link = document.createElement("a");
                    link.href = documentData.receipt_url;
                    link.download = name;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                  className="bg-[#F58A3B] text-white px-4 py-2 rounded hover:bg-green-600 flex items-center mt-2 w-full"
                >
                  <FaFileAlt className="mr-2" /> View Receipt
                </button>
              )}
            </div>
            {/* Certificate */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Upload Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                className="border p-2 rounded text-sm w-full"
              />
              {selectedFile && (
                <button
                  onClick={handleCancelFile}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleUploadCertificate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mt-2 w-full"
              >
                <FaFileAlt className="mr-2" /> Upload Certificate
              </button>
              {certificates.some(
                (c) => String(c.document_id) === String(documentId)
              ) && (
                <button
                  onClick={() => {
                    const cert = certificates.find(
                      (c) => String(c.document_id) === String(documentId)
                    );
                    window.open(cert.file_url, "_blank");
                  }}
                  className="bg-[#F58A3B] text-white px-4 py-2 rounded flex items-center mt-2 w-full"
                >
                  <FaFileAlt className="mr-2" /> View Certificate
                </button>
              )}
            </div>
          </div>

          {/* Download OC Button */}
          <button
            onClick={handleDownloadAllDocuments}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <FaDownload className="mr-2" />
            {isLoading ? "Downloading..." : "Download OC"}
          </button>

          {/* Preview Modal */}
          {/* {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
              <div className="relative w-3/4 h-3/4 bg-white shadow-lg rounded-lg">
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded"
                >
                  Close
                </button>
                <iframe
                  src={previewReceiptFile || previewFile}
                  className="w-full h-full border-none"
                  title="Preview"
                />
              </div>
            </div>
          )} */}

          {/* Rejection Reason */}
          {openContainer === "rejection" && (
            <div className="mt-4 space-y-2">
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleUpdateStatus("Rejected")}
                  disabled={!rejectionReason.trim()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-400"
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setOpenContainer(null);
                    setRejectionReason("");
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <Draggable handle=".drag-handle" nodeRef={nodeRef}>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={nodeRef}
              className="relative w-3/4 md:w-2/3 lg:w-1/2 h-3/4 bg-gray-100 rounded-lg p-4 drag-handle cursor-move"
            >
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
                onClick={() => setPreviewFile(null)}
              >
                &times;
              </button>
              <h3 className="text-xl font-medium mb-4 text-center">
                Document Preview
              </h3>
              <iframe
                src={getEmbeddableUrl(previewFile)}
                title="Document Preview"
                className="w-full h-full border rounded"
              />
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default InvoicePage;
