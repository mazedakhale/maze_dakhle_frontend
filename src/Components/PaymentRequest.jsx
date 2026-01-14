import  { useEffect, useState } from "react";
import axios from "axios";
import { FaFileInvoice, FaDownload, FaTimes } from "react-icons/fa"; // Document icon
import jwtDecode from "jwt-decode"; // JWT decoder
import Swal from "sweetalert2"; // Popup notifications
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const PaymentRequest = () => {
 const [documents, setDocuments] = useState([]);
   const [certificates, setCertificates] = useState([]);
   const [distributorId, setDistributorId] = useState(null);
   const navigate = useNavigate();
   const [isAdding, setIsAdding] = useState(false);
   const [paymentRequests, setPaymentRequests] = useState({});
   const [processingRequests, setProcessingRequests] = useState({});  // Track which requests are being processed

   // Helper function to detect name fields in multiple languages
   const getApplicantName = (documentFields) => {
     if (!documentFields) return "-";
     const namePatterns = ["name", "applicant name", "full name", "customer name", "person name", "नाम", "आवेदक का नाम", "पूरा नाम", "व्यक्ति का नाम", "ग्राहक का नाम", "नाव", "अर्जदाराचे नाव", "पूर्ण नाव", "व्यक्तीचे नाव", "ग्राहकाचे नाव", "applicant", "अर्जदार", "आवेदक"];
     const isNameField = (fieldName) => {
       if (!fieldName || typeof fieldName !== "string") return false;
       const lowerFieldName = fieldName.toLowerCase().trim();
       const matchesPattern = namePatterns.some(pattern => lowerFieldName.includes(pattern.toLowerCase()) || fieldName.includes(pattern));
       if (matchesPattern) return true;
       const nameIndicators = [/\bname\b/i, /\bfull\b/i, /\bfirst\b/i, /\blast\b/i, /\bapplicant\b/i, /name$/i, /नाम$/i, /नाव$/i, /^name/i, /^नाम/i, /^नाव/i, /^full/i, /^applicant/i];
       return nameIndicators.some(pattern => pattern.test(fieldName));
     };
     const findBestNameField = (fields) => {
       const priorities = [/full.*name|name.*full/i, /applicant.*name|name.*applicant/i, /^name$/i, /name/i, /नाम|नाव/];
       for (const priority of priorities) {
         const match = fields.find(field => priority.test(field.key));
         if (match) return match;
       }
       return fields[0];
     };
     if (Array.isArray(documentFields)) {
       const nameFields = documentFields.filter(field => isNameField(field.field_name)).map(field => ({ key: field.field_name, value: field.field_value }));
       if (nameFields.length === 0) return "-";
       return findBestNameField(nameFields)?.value || "-";
     }
     if (typeof documentFields === "object") {
       const nameFields = Object.keys(documentFields).filter(key => isNameField(key)).map(key => ({ key, value: documentFields[key] }));
       if (nameFields.length === 0) return "-";
       return findBestNameField(nameFields)?.value || "-";
     }
     return "-";
   };
 
   // Decode token and extract user ID
   useEffect(() => {
     const token = localStorage.getItem("token");
     
     if (token) {
       try {
         const decodedToken = jwtDecode(token);
         const userId =
           decodedToken.user_id || decodedToken.id || decodedToken.user;
         if (userId) {
          console.log("Distributor ID:", userId);
           setDistributorId(userId);
           fetchDocuments(userId);
           fetchCertificates(); // Fetch certificates after fetching documents
           fetchPaymentRequests(userId); // Pass userId directly
         } else {
           console.error("User ID is missing in the decoded token.");
         }
       } catch (error) {
         console.error("Error decoding token:", error);
       }
     } else {
       console.error("Token is missing.");
     }
   }, []);
 
   // Fetch documents by distributor ID
   const fetchDocuments = async (distributorId) => {
     try {
       const response = await axios.get(
         `${API_BASE_URL}/documents/list/${distributorId}`
       );
 
       // Filter documents and sort by `uploaded_at` in descending order
       const filteredDocuments = response.data.documents
         .filter(
           (doc) =>
             doc.status === "Uploaded" ||
             doc.status === "Completed" ||
             doc.status === "Distributor Rejected"
         )
         .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)); // Sort by most recent
 
       setDocuments(filteredDocuments);
     } catch (error) {
       console.error("Error fetching documents:", error);
     }
   };
 
   // Fetch certificates
   const fetchCertificates = async () => {
     try {
       const response = await axios.get(`${API_BASE_URL}/certificates`); // Adjust URL if needed
       console.log("Certificates API Response:", response.data);
       setCertificates(response.data);
     } catch (error) {
       console.error("Error fetching certificates:", error);
     }
   };

   // Fetch payment requests status for documents
   const fetchPaymentRequests = async (distId) => {
     try {
       const id = distId || distributorId;
       console.log("Fetching payment requests for distributor:", id);
       if (!id) return;
       const response = await axios.get(
         `${API_BASE_URL}/payment-requests/distributor/${id}`
       );
       const requestsMap = {};
       console.log("Payment Requests API Response:", response.data);
       response.data.forEach((req) => {
         requestsMap[req.document_id] = req;
       });
       setPaymentRequests(requestsMap);
     } catch (error) {
       console.error("Error fetching payment requests:", error);
     }
   };
 
   // Get certificate by document_id
   const getCertificateByDocumentId = (documentId) => {
     return certificates.find((cert) => cert.document_id === documentId);
   };

   // Check if payment request exists for document
   const hasPaymentRequest = (documentId) => {
     return paymentRequests[documentId] ? true : false;
   };

   // Get payment request status for document
   const getPaymentRequestStatus = (documentId) => {
     return paymentRequests[documentId]?.status || null;
   };

  const handleCreatePaymentRequest = async (doc) => {
    // Prevent multiple clicks
    if (processingRequests[doc.document_id]) {
      return; // Already processing this request
    }

    try {
      // Mark this document as being processed
      setProcessingRequests(prev => ({ ...prev, [doc.document_id]: true }));

      // Get the document price and distributor-specific commission
      const [priceResponse, distributorCommissionResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/prices/category/${doc.category_id}/subcategory/${doc.subcategory_id}`),
        axios.get(`${API_BASE_URL}/distributor-commissions`)
      ]);
      
      // Debug logging to check the response structure
     
      if (!priceResponse.data) {
        Swal.fire("Error", "Price not found for this document type.", "error");
        setProcessingRequests(prev => ({ ...prev, [doc.document_id]: false }));
        return;
      }

      // Find distributor-specific commission for this category/subcategory
      const distributorCommission = distributorCommissionResponse.data.find(comm => 
        comm.distributor_id === distributorId && 
        comm.category_id === doc.category_id && 
        comm.subcategory_id === doc.subcategory_id
      );
      
      // Use distributor-specific commission if available, otherwise fall back to general commission
      const amount = distributorCommission ? 
        parseFloat(distributorCommission.commission_amount || distributorCommission.amount || 0) :
        parseFloat(priceResponse.data.distributor_commission || 0);
    
      
      if (amount <= 0) {
        Swal.fire("Error", "No commission amount set for this document type and distributor.", "error");
        setProcessingRequests(prev => ({ ...prev, [doc.document_id]: false }));
        return;
      }
      // Get applicant name using multilingual detection
      const applicantName = getApplicantName(doc.document_fields);

      // Create payment request
      const response = await axios.post(
        `${API_BASE_URL}/payment-requests`,
        {
          document_id: doc.document_id,
          application_id: doc.application_id,
          distributor_id: distributorId,
          customer_id: doc.user_id,
          amount: amount,
          category_name: doc.category_name,
          subcategory_name: doc.subcategory_name,
          applicant_name: applicantName,
        }
      );

      if (response.data) {
        Swal.fire(
          "Success",
          `Payment request for ₹${amount} has been sent to admin!`,
          "success"
        );
        // Refresh the document list and payment requests
        fetchDocuments(distributorId);
        fetchPaymentRequests();
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
      if (error.response?.data?.message) {
        Swal.fire("Error", error.response.data.message, "error");
      } else {
        Swal.fire("Error", "Failed to create payment request.", "error");
      }
    } finally {
      // Always remove processing state after request completes
      setProcessingRequests(prev => ({ ...prev, [doc.document_id]: false }));
    }
  };

 
   // View certificate
   const handleViewCertificate = async (documentId) => {
     const certificate = getCertificateByDocumentId(documentId);
     if (!certificate) {
       Swal.fire("Error", "Certificate not found.", "error");
       return;
     }
 
     // Open the link first before fetching data (avoids popup blocker)
     const newTab = window.open("", "_blank");
 
     try {
       console.log(
         `Fetching certificate for Certificate ID: ${certificate.certificate_id}`
       );
       const response = await axios.get(
         `${API_BASE_URL}/certificates/${certificate.certificate_id}`
       );
       console.log("View Certificate API Response:", response.data);
 
       if (response.data && response.data.file_url) {
         newTab.location.href = response.data.file_url; // Set the URL in the new tab
       } else {
         newTab.close(); // Close the tab if no file is found
         Swal.fire("Error", "Certificate not found.", "error");
       }
     } catch (error) {
       newTab.close(); // Close the tab if an error occurs
       console.error("Error fetching certificate:", error);
       Swal.fire("Error", "Failed to fetch certificate.", "error");
     }
   };
 
   const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
     navigate(`/Distributorinvoice/${documentId}`, {
       state: { categoryId, subcategoryId },
     });
   };
 
   const handleView = (documentId, categoryId, subcategoryId) => {
     navigate(`/Distributorview/${documentId}`, {
       state: { categoryId, subcategoryId },
     });
   };
 
   const handleDownloadReceipt = (receiptUrl, documentName) => {
     try {
       // Extract the file extension from the URL (e.g., "pdf", "jpg", "png")
       const fileExtension = receiptUrl.split(".").pop().toLowerCase();
 
       // Generate the file name (e.g., "MyDocument_receipt.pdf")
       const fileName = `${documentName}_receipt.${fileExtension}`;
 
       // Create a temporary <a> element to trigger the download
       const link = document.createElement("a");
       link.href = receiptUrl;
       link.download = fileName; // Set the file name for the download
       link.style.display = "none"; // Hide the link element
       document.body.appendChild(link); // Add the link to the DOM
       link.click(); // Trigger the download
       document.body.removeChild(link); // Clean up by removing the link
     } catch (error) {
       console.error("Error downloading receipt:", error);
       Swal.fire(
         "Error",
         "Failed to download receipt. Please try again.",
         "error"
       );
     }
   };
 
   const handleDownloadCertificate = async (documentId, name) => {
     try {
       const response = await axios.get(
         `${API_BASE_URL}/download-certificate/${documentId}`,
         {
           responseType: "blob", // Important to handle file downloads
         }
       );
 
       // Create a downloadable link
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement("a");
       link.href = url;
       link.setAttribute("download", `${name}.zip`); // Set ZIP file name based on user name
       document.body.appendChild(link);
       link.click();
       link.parentNode.removeChild(link);
     } catch (error) {
       console.error("Error downloading certificate:", error);
       alert("Failed to download certificate.");
     }
   };
 
   return (
     <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
       <div className="w-[90%] max-w-6xl bg-white shadow-lg rounded-lg">
         <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
           <h2 className="text-2xl font-bold text-gray-800 text-center">
             Manage Completed Applications
           </h2>
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
         <div className=" overflow-x-auto">
           <table className="w-full border border-gray-300">
             <thead className="bg-[#F58A3B14]">
               <tr>
                 {[
                   "Application Id",
                   "Application Name",
                   "DateTime",
                   "Category",
                   "Subcategory",
                   "Verification",
                   "Actions",
                   "View",
                   " Receipt",
                   "Certificate",
                   "Payment Request",
                 ].map((header, index) => (
                   <th
                     key={index}
                     className="border border-gray-300 p-3 text-center font-semibold text-black"
                   >
                     {header}
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {documents.map((doc, index) => (
                 <tr
                   key={doc.document_id}
                   className={`border border-gray-300 ${
                     index % 2 === 0 ? "bg-white" : "bg-[#F58A3B14]"
                   }`}
                 >
                   <td className="border p-3 text-center">
                     {doc.application_id}
                   </td>
                   <td className="px-4 py-2 border text-sm">
                     {getApplicantName(doc.document_fields)}
                   </td>
                   <td className="border p-2 text-center">
                     {(() => {
                       const date = new Date(doc.uploaded_at);
                       const formattedDate = `${String(date.getDate()).padStart(
                         2,
                         "0"
                       )}-${String(date.getMonth() + 1).padStart(
                         2,
                         "0"
                       )}-${date.getFullYear()}`;
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
                   <td className="border p-3 text-center">
                     {doc.category_name}
                   </td>
                   <td className="border p-3 text-center">
                     {doc.subcategory_name}
                   </td>
 
                   <td className="border p-2">
                     <div className="flex flex-col gap-1">
                       {/* Status Badge */}
                       <span
                         className={`px-3 py-1 rounded-full text-white text-xs ${
                           doc.status === "Approved"
                             ? "bg-green-500"
                             : doc.status === "Rejected"
                             ? "bg-red-500"
                             : doc.status === "Completed"
                             ? "bg-yellow-500" // Color for Completed
                             : "bg-blue-500" // Default color
                         }`}
                       >
                         {doc.status}
                       </span>
 
                       {/* Latest Status Date and Time */}
                       {doc.status_history
                         ?.sort(
                           (a, b) =>
                             new Date(b.updated_at) - new Date(a.updated_at)
                         ) // Sort by latest date
                         .slice(0, 1) // Take the first entry (latest status)
                         .map((statusEntry, index) => (
                           <div key={index} className="text-xs text-gray-600">
                             {new Date(statusEntry.updated_at).toLocaleString(
                               "en-US",
                               {
                                 year: "numeric",
                                 month: "2-digit",
                                 day: "2-digit",
                                 hour: "2-digit",
                                 minute: "2-digit",
                                 second: "2-digit", // Added seconds
                                 hour12: true, // Use AM/PM
                               }
                             )}
                           </div>
                         ))}
                     </div>
                   </td>
 
                   <td className="border p-3 text-center">
                     <button
                       onClick={() => handleViewInvoice(doc.document_id)}
                       className="bg-red-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-red-600 transition"
                     >
                       <FaFileInvoice className="mr-1" /> Action
                     </button>
                   </td>
 
                   <td className="border p-3 text-center">
                     <button
                       onClick={() => handleView(doc.document_id)}
                       className="bg-indigo-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-indigo-600 transition"
                     >
                       <FaFileInvoice className="mr-1" /> View
                     </button>
                   </td>
                   <td className="border p-3 text-center">
                     {doc.receipt_url ? (
                       <button
                         onClick={() =>
                           handleDownloadReceipt(doc.receipt_url, doc.name)
                         }
                         className="bg-blue-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                       >
                         <FaDownload className="mr-1" /> Download Receipt
                       </button>
                     ) : (
                       <span className="text-gray-500 text-center">
                         Not Available
                       </span>
                     )}
                   </td>
                   <td className="border px-4 py-2 text-center">
                     {["Uploaded", "Completed"].includes(doc.status) &&
                     getCertificateByDocumentId(doc.document_id) ? (
                       <button
                         onClick={() => handleViewCertificate(doc.document_id)}
                         className="bg-[#F58A3B] text-white px-3 py-1 rounded hover:bg-green-600 transition"
                       >
                         View Certificate
                       </button>
                     ) : (
                       <span className="text-gray-500">No Certificate</span>
                     )}
                   </td>
                   <td className="border px-4 py-2 text-center">
                     {["Uploaded", "Completed"].includes(doc.status) ? (
                       hasPaymentRequest(doc.document_id) ? (
                         getPaymentRequestStatus(doc.document_id) === 'Approved' || getPaymentRequestStatus(doc.document_id) === 'Paid' ? (
                           <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-semibold border border-green-300">
                             Paid
                           </span>
                         ) : (
                          
                           <span className={`px-3 py-1 rounded ${
                             getPaymentRequestStatus(doc.document_id) === 'Pending' 
                               ? 'bg-yellow-100 text-yellow-800'
                               : 'bg-red-100 text-red-800'
                           }`}>
                             {getPaymentRequestStatus(doc.document_id)}
                           </span>
                         )
                       ) : (
                         <button
                           onClick={() => handleCreatePaymentRequest(doc)}
                           disabled={processingRequests[doc.document_id]}
                           className={`px-3 py-1 rounded transition ${
                             processingRequests[doc.document_id]
                               ? 'bg-gray-400 text-white cursor-not-allowed'
                               : 'bg-[#F58A3B] text-white hover:bg-orange-600'
                           }`}
                         >
                          {console.log(doc.document_id)}
                          {console.log(paymentRequests)}
                            {console.log('Payment Request Status:', getPaymentRequestStatus(doc.document_id))}
                           {processingRequests[doc.document_id] ? 'Processing...' : 'Request Payment'}
                         </button>
                       )
                     ) : (
                       <span className="text-gray-500">Not Available</span>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 };
export default PaymentRequest
