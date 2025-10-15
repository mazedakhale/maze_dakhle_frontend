import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import logo1 from "../assets/logo.png";
import { FaFileInvoice, FaDownload, FaTimes } from "react-icons/fa"; // Document icon
import { useNavigate } from "react-router-dom";
const ApplicationView = () => {
  const { documentId } = useParams();
  const location = useLocation();
  const { categoryId: stateCategoryId, subcategoryId: stateSubcategoryId } =
    location.state || {};

  const [documentData, setDocumentData] = useState({});
  const [documentNames, setDocumentNames] = useState([]);
  const printRef = useRef();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => {
    console.log("Fetched from previous page state:");
    console.log("Document ID:", documentId);
    console.log("Category ID:", stateCategoryId);
    console.log("Subcategory ID:", stateSubcategoryId);
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  // Fetch Document Data
  const fetchDocumentData = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/singledocument/documentby/${documentId}`
      );
      const data = response.data.document;
      setDocumentData(data);

      const category = stateCategoryId || data.category_id;
      const subcategory = stateSubcategoryId || data.subcategory_id;

      if (category && subcategory) {
        const fieldNamesResponse = await axios.get(
          `http://localhost:3000/field-names/${category}/${subcategory}`
        );
        setDocumentNames(fieldNamesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  }, [documentId, stateCategoryId, stateSubcategoryId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId, fetchDocumentData]);

  // Print Handler
  // Print Handler
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Application</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            h2, h3 { text-align: center; }
            img { display: block; margin: 0 auto; max-width: 100px; height: auto; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              table th, table td { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!documentData)
    return <div className="text-center text-lg mt-10">Loading Invoice...</div>;
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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      <div className="w-4/5 max-w-4xl border rounded-lg shadow-lg bg-white p-6 overflow-auto h-[90vh] relative">
        <div className="relative border-t-4 p-4 rounded-t-lg">
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {/* Centered Print Button */}
        <div className="w-full flex justify-center mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-[#00234E] text-white px-6 py-3 rounded-lg hover:bg-blue-900"
          >
            Print
          </button>
        </div>

        {/* Horizontal Line */}
        <hr className="mb-4" />

        {/* Printable Area */}
        <div ref={printRef}>
          {/* Header */}
          <div className="w-full flex items-center justify-between border-b pb-4 mb-4">
            <img src={logo1} alt="Logo" className="w-24 h-24 object-contain" />
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-gray-700">
                Application Details
              </h2>
            </div>{" "}
            <div className="text-right">
              <table className="text-sm text-gray-700 border border-gray-300">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold pr-2 border-r border-gray-300 p-2">
                      Date:
                    </td>
                    <td className="border p-2 text-center">
                      {formatDateTime(documentData.uploaded_at)}
                    </td>{" "}
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 border-r border-gray-300 p-2">
                      Application ID:
                    </td>
                    <td className="p-2">
                      {documentData.application_id || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Horizontal Line */}
          <hr className="border-gray-400 mb-6" />

          {/* Category Header */}
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            Application for {documentData.category_name || "N/A"}
          </h3>

          {/* Fields in Key-Value Format */}
          <table className="w-full border border-gray-300 mb-6">
            <tbody>
              {[
                { label: "Application ID", value: documentData.application_id },
                //  { label: "User ID", value: documentData.user_id },
                { label: "Category", value: documentData.category_name },

                { label: "Subcategory", value: documentData.subcategory_name },
                { label: "VLE Name", value: documentData.name },
                { label: " VLE Email", value: documentData.email },
                { label: "VLE Phone", value: documentData.phone },
                {
                  label: "Status",
                  value: (
                    <div className="flex flex-col gap-1">
                      {/* Status */}
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs ${
                          documentData.status === "Approved"
                            ? "bg-green-500"
                            : documentData.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500" // Default color for other statuses
                        }`}
                      >
                        {documentData.status}
                      </span>

                      {/* Latest Status Date and Time */}
                      {documentData.status_history
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
                  ),
                }, // { label: "Address", value: documentData.address },
                // { label: "Distributor", value: documentData.distributor_id || 'Not Assigned' }
              ]
                .reduce((rows, field, index, array) => {
                  if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                  return rows;
                }, [])
                .map((pair, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    {pair.map((field, index) => (
                      <React.Fragment key={index}>
                        <td
                          className="p-3 font-semibold border-r border-gray-300 w-1/6"
                          style={{ backgroundColor: "#F58A3B14" }}
                        >
                          {field.label}
                        </td>
                        <td className="p-3 border-r border-gray-300">
                          {field.value || "N/A"}
                        </td>
                      </React.Fragment>
                    ))}
                    {pair.length < 2 && (
                      <>
                        <td
                          className="p-3 border-r border-gray-300"
                          style={{ backgroundColor: "#F58A3B14" }}
                        ></td>
                        <td className="p-3 border-r border-gray-300"></td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Document Fields Section */}
          <h3 className="text-2xl text-gray-700 font-semibold mb-4">
            Document Fields
          </h3>
          <table className="w-full table-fixed border border-gray-300">
            <tbody>
              {(Array.isArray(documentData.document_fields)
                ? documentData.document_fields
                : []
              )
                .reduce((rows, field, index, array) => {
                  if (index % 2 === 0) rows.push(array.slice(index, index + 2));
                  return rows;
                }, [])
                .map((pair, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    {pair.map((field, index) => (
                      <React.Fragment key={index}>
                        <td className="w-1/5 p-3 font-semibold border-r border-gray-300 bg-white">
                          {field.field_name}
                        </td>
                        <td className="w-1/3 p-3 border-r border-gray-300">
                          {field.field_value || "N/A"}
                        </td>
                      </React.Fragment>
                    ))}
                    {pair.length < 2 && (
                      <>
                        <td className="w-1/5 p-3 bg-white border-r border-gray-300"></td>
                        <td className="w-1/3 p-3 border-r border-gray-300"></td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationView;
