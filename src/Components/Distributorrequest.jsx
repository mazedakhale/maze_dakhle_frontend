// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import jwtDecode from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { FaDownload, FaTimes } from "react-icons/fa";

// const ErrorRequests = () => {
//   const [errorRequests, setErrorRequests] = useState([]);
//   const [certificates, setCertificates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const [selectedFile, setSelectedFile] = useState({});
//   const navigate = useNavigate();

//   const distributorId = jwtDecode(localStorage.getItem("token"))?.user_id || null;

//   useEffect(() => {
//     if (distributorId) {
//       fetchErrorRequests();
//       fetchCertificates();
//     }
//   }, [distributorId]);

//   const fetchErrorRequests = async () => {
//     const { data } = await axios.get(
//       `https://mazedakhale.in/api/request-errors/distributor/${distributorId}`
//     );
//     setErrorRequests(data.filter(req => req.request_status !== "Distributor Rejected" && req.request_status !== "Completed"));
//   };

//   const fetchCertificates = async () => {
//     const { data } = await axios.get("https://mazedakhale.in/api/certificates");
//     setCertificates(data);
//   };

//   const updateRequestStatus = async (requestId, status, reason = "") => {
//     await axios.patch(`https://mazedakhale.in/api/request-errors/update-status/${requestId}`, {
//       request_status: status,
//       rejectionReason: reason,
//     });
//   };

//   const handleRejectStatus = async requestId => {
//     const { value: reason } = await Swal.fire({
//       title: 'Rejection Reason',
//       input: 'text',
//       showCancelButton: true,
//       inputValidator: v => !v.trim() && 'Reason required',
//     });
//     if (!reason) return;

//     Swal.showLoading();
//     await updateRequestStatus(requestId, 'Distributor Rejected', reason);
//     await fetchErrorRequests();
//     Swal.fire('Rejected', '', 'success');
//   };

//   const handleDownload = (url, name, type) => {
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `${name}_${type}.${url.split('.').pop()}`;
//     link.click();
//   };

//   const handleFileChange = (e, docId) => {
//     setSelectedFile(prev => ({ ...prev, [docId]: e.target.files[0] }));
//   };

//   const handleUploadFile = async (req, type) => {
//     const file = selectedFile[req.document_id];
//     if (!file) return Swal.fire('Error', 'Please select a file.', 'error');

//     const formData = new FormData();
//     formData.append(type === 'certificate' ? 'file' : 'receipt', file);
//     if (type === 'certificate') formData.append('user_id', distributorId);

//     const url =
//       type === 'certificate'
//         ? `https://mazedakhale.in/api/certificates/update/${req.document_id}`
//         : `https://mazedakhale.in/api/documents/update-receipt/${req.document_id}`;

//     const method = type === 'certificate' ? 'patch' : 'put';

//     try {
//       await axios[method](url, formData);
//       await updateRequestStatus(req.request_id, type === 'certificate' ? 'Uploaded' : 'Receipt Uploaded');
//       await fetchErrorRequests();
//       Swal.fire('Uploaded', `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`, 'success');
//     } catch {
//       Swal.fire('Error', `Failed to upload ${type}.`, 'error');
//     }
//   };

//   const filtered = errorRequests.filter(r =>
//     (filterType === "all" || r.error_type === filterType) &&
//     (statusFilter === "all" || r.request_status === statusFilter) &&
//     Object.values(r).some(v => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
//       <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
//         <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
//           <h2 className="text-2xl font-bold text-center">Manage Error Requests</h2>
//           <button onClick={() => navigate('/Ddashinner')} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-4 flex items-center gap-4">
//           <select className="border p-2 rounded-md" value={filterType} onChange={e => setFilterType(e.target.value)}>
//             <option value="all">All Types</option>
//             <option value="certificate">Certificate</option>
//             <option value="receipt">Receipt</option>
//             <option value="payment">Payment</option>
//           </select>
//           <select className="border p-2 rounded-md" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
//             <option value="all">All Statuses</option>
//             <option>Pending</option>
//             <option>Uploaded</option>
//             <option>Approved</option>
//             <option>Rejected</option>
//             <option>Receipt Uploaded</option>
//           </select>
//           <input className="ml-auto border p-2 rounded-md w-64" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
//         </div>
//         <div className="p-6 overflow-x-auto">
//           <table className="w-full border border-gray-300">
//             <thead className="bg-[#F58A3B14]">
//               <tr>
//                 {["Req ID", "App ID", "Name", "Type", "Desc", "Doc", "Status", "Date", "Reject", "Download", "Upload"].map(h => (
//                   <th key={h} className="border p-2">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length ? filtered.map((r, i) => (
//                 <tr key={r.request_id} className={i % 2 ? 'bg-[#F58A3B14]' : 'bg-white'}>
//                   <td className="border p-2">{r.request_id}</td>
//                   <td className="border p-2">{r.application_id}</td>
//                   <td className="border p-2">{r.document_fields?.["APPLICANT NAME"] || 'N/A'}</td>
//                   <td className="border p-2 capitalize">{r.error_type}</td>
//                   <td className="border p-2">{r.request_description}</td>
//                   <td className="border p-2 text-center">
//                     <a href={r.error_document} target="_blank" rel="noopener" className="text-blue-500">View</a>
//                   </td>
//                   <td className="border p-2">{r.request_status}</td>
//                   <td className="border p-2 text-center">
//                     {(() => {
//                       const date = new Date(r.uploaded_at);
//                       const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
//                       const formattedTime = date.toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         second: '2-digit',
//                         hour12: true,
//                       });
//                       return (
//                         <>
//                           <div>{formattedDate}</div>
//                           <div className="text-sm text-gray-600">{formattedTime}</div>
//                         </>
//                       );
//                     })()}
//                   </td>                  <td className="border p-2 text-center">
//                     <button className="bg-red-500 text-white px-2 rounded" onClick={() => handleRejectStatus(r.request_id)}>Reject</button>
//                   </td>
//                   <td className="border p-2 text-center">
//                     {r.receipt_url && <FaDownload className="mx-auto cursor-pointer" onClick={() => handleDownload(r.receipt_url, r.name, 'receipt')} />}
//                   </td>
//                   <td className="border p-2">
//                     <input type="file" className="mb-1" onChange={e => handleFileChange(e, r.document_id)} />
//                     <button className="bg-blue-500 text-white px-2 rounded" onClick={() => handleUploadFile(r, r.error_type)}>Upload</button>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr><td colSpan={11} className="text-center py-4">No requests found.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ErrorRequests;
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaTimes } from "react-icons/fa";

const ErrorRequests = () => {
  const [errorRequests, setErrorRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedFile, setSelectedFile] = useState({});
  const navigate = useNavigate();

  const distributorId = jwtDecode(localStorage.getItem("token"))?.user_id || null;

  useEffect(() => {
    if (distributorId) {
      fetchErrorRequests();
      fetchCertificates();
    }
  }, [distributorId]);

  const fetchErrorRequests = async () => {
    const { data } = await axios.get(
      `https://mazedakhale.in/api/request-errors/distributor/${distributorId}`
    );
    setErrorRequests(data.filter(req => req.request_status !== "Distributor Rejected" && req.request_status !== "Completed"));
  };

  const fetchCertificates = async () => {
    const { data } = await axios.get("https://mazedakhale.in/api/certificates");
    setCertificates(data);
  };

  const updateRequestStatus = async (requestId, status, reason = "") => {
    await axios.patch(`https://mazedakhale.in/api/request-errors/update-status/${requestId}`, {
      request_status: status,
      rejectionReason: reason,
    });
  };

  const handleRejectStatus = async requestId => {
    const { value: reason } = await Swal.fire({
      title: 'Rejection Reason',
      input: 'text',
      showCancelButton: true,
      inputValidator: v => !v.trim() && 'Reason required',
    });
    if (!reason) return;

    Swal.showLoading();
    await updateRequestStatus(requestId, 'Distributor Rejected', reason);
    await fetchErrorRequests();
    Swal.fire('Rejected', '', 'success');
  };

  const handleDownload = (url, name, type) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}_${type}.${url.split('.').pop()}`;
    link.click();
  };

  const handleFileChange = (e, docId) => {
    setSelectedFile(prev => ({ ...prev, [docId]: e.target.files[0] }));
  };

  const handleUploadFile = async (req, type) => {
    const file = selectedFile[req.document_id];
    if (!file) return Swal.fire('Error', 'Please select a file.', 'error');

    const formData = new FormData();
    formData.append(type === 'certificate' ? 'file' : 'receipt', file);
    if (type === 'certificate') formData.append('user_id', distributorId);

    const url =
      type === 'certificate'
        ? `https://mazedakhale.in/api/certificates/update/${req.document_id}`
        : `https://mazedakhale.in/api/documents/update-receipt/${req.document_id}`;

    const method = type === 'certificate' ? 'patch' : 'put';

    try {
      await axios[method](url, formData);
      await updateRequestStatus(req.request_id, type === 'certificate' ? 'Uploaded' : 'Receipt Uploaded');
      await fetchErrorRequests();
      Swal.fire('Uploaded', `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`, 'success');
    } catch {
      Swal.fire('Error', `Failed to upload ${type}.`, 'error');
    }
  };

  const filtered = errorRequests.filter(r =>
    (filterType === "all" || r.error_type === filterType) &&
    (statusFilter === "all" || r.request_status === statusFilter) &&
    Object.values(r).some(v => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-center">Manage Error Requests</h2>
          <button onClick={() => navigate('/Ddashinner')} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-4 flex items-center gap-4">
          <select className="border p-2 rounded-md" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="certificate">Certificate</option>
            <option value="receipt">Receipt</option>
            <option value="payment">Payment</option>
          </select>
          <select className="border p-2 rounded-md" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option>Pending</option>
            <option>Uploaded</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Receipt Uploaded</option>
          </select>
          <input className="ml-auto border p-2 rounded-md w-64" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-[#F58A3B14]">
              <tr>
                {["Req ID", "App ID", "Name", "Type", "Desc", "Doc", "Status", "Date", "Reject", "Download", "Upload"].map(h => (
                  <th key={h} className="border p-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r, i) => (
                <tr key={r.request_id} className={i % 2 ? 'bg-[#F58A3B14]' : 'bg-white'}>
                  <td className="border p-2">{r.request_id}</td>
                  <td className="border p-2">{r.application_id}</td>
                  <td className="border p-2">{r.document_fields?.["APPLICANT NAME"] || 'N/A'}</td>
                  <td className="border p-2 capitalize">{r.error_type}</td>
                  <td className="border p-2">{r.request_description}</td>
                  <td className="border p-2 text-center">
                    <a href={r.error_document} target="_blank" rel="noopener" className="text-blue-500">View</a>
                  </td>
                  <td className="border p-2">{r.request_status}</td>
                  <td className="border p-2 text-center">
                    {(() => {
                      const date = new Date(r.uploaded_at);
                      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                      const formattedTime = date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      });
                      return (
                        <>
                          <div>{formattedDate}</div>
                          <div className="text-sm text-gray-600">{formattedTime}</div>
                        </>
                      );
                    })()}
                  </td>                  <td className="border p-2 text-center">
                    <button className="bg-red-500 text-white px-2 rounded" onClick={() => handleRejectStatus(r.request_id)}>Reject</button>
                  </td>
                  <td className="border p-2 text-center">
                    {r.receipt_url && <FaDownload className="mx-auto cursor-pointer" onClick={() => handleDownload(r.receipt_url, r.name, 'receipt')} />}
                  </td>
                  <td className="border p-2">
                    <input type="file" className="mb-1" onChange={e => handleFileChange(e, r.document_id)} />
                    <button className="bg-blue-500 text-white px-2 rounded" onClick={() => handleUploadFile(r, r.error_type)}>Upload</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={11} className="text-center py-4">No requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ErrorRequests;
